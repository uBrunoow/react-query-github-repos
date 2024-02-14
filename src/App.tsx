import { Button } from "@/components/ui/button"
import { getRepositories } from "./api/getRepositories"
import { useQuery } from 'react-query'
import { getUserInformation } from "./api/getUserInformations"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { Clock, Github, Globe, RotateCcw, Search, X } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import RepositoryClone from "./components/RepositoryItem/RepositoryItem"


function App() {

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchUser, setSearchUser] = useState('uBrunoow')
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isRecentSearchOpen, setIsRecentSearchOpen] = useState(false)

  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const { data: user, refetch: refetchUser, error: userError, isLoading: userLoading} = useQuery(['user', searchUser], async () => {
    const response = await getUserInformation(searchUser);
    if (!response) {
      throw new Error('Network response was not ok')
    }
    return response;
    },
    { enabled: false }
  );

  const { data, isLoading, error, refetch } = useQuery(
    ['repositories', searchUser],
    async () => {
      const response = await getRepositories(searchUser);
      if (!response) {
        throw new Error('Network response was not ok')
      }
      return response;
    },
    { enabled: false }
  );

  const handleSearch = async () => {
    try {
      await refetch();
      await refetchUser();
      setCurrentPage(1);
      setIsRecentSearchOpen(false)

      if (searchUser && !recentSearches.includes(searchUser)) {
        setRecentSearches((prevSearches) => [searchUser, ...prevSearches]);
      }
    } catch (error) {
      console.error('Erro ao refetch', error);
    }
  };

  const handleRecentSearch = (recentSearch: string) => {
    setSearchUser(recentSearch);
    handleSearch();
  };

  const handleRemoveRecentSearch = (index: number) => {
    setRecentSearches((prevSearches) => {
      const newSearches = [...prevSearches];
      newSearches.splice(index, 1);
      return newSearches;
    });
  };

  const filteredRepositories = useMemo(() => {
    let filteredData = data || [];

    if (searchTerm) {
      filteredData = filteredData.filter((repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredData;
  }, [data, searchTerm]);

  const visibleRepositories = filteredRepositories.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredRepositories.length / itemsPerPage);

  const handleClearFilter = () => {
    setSearchTerm("")
  }

  const handleClearUserSearch = () => {
    setSearchUser("")
    setIsRecentSearchOpen(false)
  }

  const handleOpenRecentSearch = () => {
    setIsRecentSearchOpen(!isRecentSearchOpen)
  }

  if (isLoading || userLoading) {
    return (
      <div className="w-screen h-screen flex items-center flex-col gap-2 justify-center text-white">
      Carregando...
      </div>
    )  
  }

  if (error || userError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-white text-3xl flex-col gap-2">
        Algo deu errado!
        <Button onClick={() => window.location.reload()} className="text-3xl h-auto flex items-center justify-center gap-2" variant={'destructive'}> <RotateCcw /> Recarregue a página</Button>
      </div>
    )
  }

  return (
      <div className="container bg-zinc-800/50 border border-zinc-700/50 rounded-md space-y-4">

        <header className="border-b border-zinc-700/50 pb-3 flex items-center justify-between w-full gap-3">
          <div className="flex gap-2">
            <div className="bg-red-500 size-4 rounded-full animate-pulse"/>
            <div className="bg-yellow-500 size-4 rounded-full animate-pulse"/>
            <div className="bg-green-500 size-4 rounded-full animate-pulse"/>
          </div>

          <form onSubmit={handleSearch} className="flex items-center justify-start gap-2 relative">
            <Input 
              placeholder="Digite o nome do usúario que você deseja ver o repositório"
              className="w-[500px] border-b border-zinc-700/50 focus:ring-2 focus:ring-indigo-500 text-white"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              onClick={handleOpenRecentSearch}
            />
            {isRecentSearchOpen && (
              // <MagicMotion>
                <div className="z-10 flex flex-col gap-2 absolute top-[48px] left-0 bg-zinc-800 w-full border border-zinc-700/50 rounded-md p-2 h-[300px] overflow-hidden">
                  <span className="text-sm text-zinc-400 border-b border-zinc-700/50 pb-2">Pesquisas recentes:</span>
                  {recentSearches.map((recentSearch, index) => (
                    <div className="flex items-center justify-between w-full gap-2">
                    <Button
                      key={index}
                      variant={"ghost"}
                      className="p-2 text-white border border-zinc-700/50 text-left w-full"
                      onClick={() => handleRecentSearch(recentSearch)}
                    >
                      <p className="text-left w-full flex items-center justify-start gap-2"> <Clock /> {recentSearch}</p>
                    </Button>
                      <p className="hover:underline text-red-500 cursor-pointer" onClick={() => handleRemoveRecentSearch(index)}>Remover</p>
                    </div>
                  ))}
                </div>
    
            )}
            <Button variant={"secondary"} className="p-2 border border-zinc-700/50" type="submit"><Search/></Button>
            <Button variant={"destructive"} className="p-2" type="button" onClick={handleClearUserSearch}><X/></Button>
          </form>
        </header>

        {!user ? (
          <p className="text-white w-full text-center font-bold h-[700px] flex items-center justify-center">Utilize o campo de busca para pesquisar os repositórios de um usuário</p>
        ) : (
          <>
          {/* <MagicMotion> */}
            <div className="flex items-center justify-center flex-col gap-2">
              <Avatar className="size-40 ring-2 ring-zinc-700">
                <AvatarImage src={user?.avatar_url}/>
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1 className="text-[2rem] text-white">{user?.name} <span className="text-indigo-500">Repo's</span></h1>
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:bg-indigo-950 rounded-md"
                onClick={handleSearch}
              >
                Busque pelos meus repositórios do github
              </Button>
            </div>

            <h1 className="font-bold text-[1.5rem] text-white">Repositórios</h1>

            <div className="flex items-center justify-start flex-row gap-2">
              <Input
                  placeholder="Busque pelo repositório"
                  className="w-[500px] text-white border border-zinc-700/50 focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              
              <Button variant={"destructive"} onClick={handleClearFilter} >Limpar filtro <X/> </Button>
            </div>

            {/* <MagicMotion> */}
              <div className="flex flex-wrap gap-3">
              {visibleRepositories.length === 0 ? (
                <div className="text-white text-center">Nenhum resultado encontrado.</div>
              ) : (
                visibleRepositories.map((repos, key) => (
                    <div key={key} className="space-y-4 relative bg-zinc-800/50 border border-zinc-700/50 rounded-lg w-[438px] p-4 hover:ring-2 hover:ring-indigo-500 transition-colors overflow-hidden">
                      <h1 className="text-white font-bold">{repos.name}</h1>
                      <span className="text-zinc-400 max-w-[350px] flex">
                        {repos.description && repos.description.length > 200
                          ? `${repos.description.slice(0, 200)}...`
                          : repos.description}
                      </span>
                      <ul className="max-w-[250px] flex-wrap flex gap-2">
                        {repos.topics.map((topic) => (
                          <li className="text-xs text-zinc-500 p-2 bg-zinc-800 rounded-md border border-zinc-700/50 ">{topic}</li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-center gap-2 absolute bottom-2 right-2"> 
                        <Button className="size-13 border border-zinc-500 hover:text-indigo-500 hover:border-indigo-500 ">
                          <a href={repos.html_url} target="_blank">
                            <Github/>
                          </a>
                        </Button>
                        {repos.homepage && (
                          <Button className="size-13 border border-zinc-500 hover:text-indigo-500 hover:border-indigo-500">
                              <a href={repos.homepage} target="_blank">
                                <Globe/>
                              </a>
                          </Button>
                        )}
                        <RepositoryClone repos={repos}/>
                      </div>
                    </div>
                )))}

                <Pagination className="text-white border border-zinc-700/50 p-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      />
                    </PaginationItem>

                    {[...Array(totalPages).keys()].map((pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={() => setCurrentPage(pageNumber + 1)}
                          className={pageNumber + 1 === currentPage ? "text-indigo-500" : ""}
                        >
                          {pageNumber + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

              </div>
  
          </>
        )}


      </div>
  )
}

export default App
