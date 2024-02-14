import { TRepos } from '@/interfaces/TRepos';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';

interface RepositoryCloneProps {
  repos: TRepos;
}

const RepositoryClone: React.FC<RepositoryCloneProps> = ({ repos }) => {

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = () => {
    if (!repos.clone_url) {
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = repos.clone_url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 12000);
  };

  return (
    <>
      {repos.clone_url && (
        <>
        {isCopied ? (
          <Button className="size-13 border border-green-500 hover:text-indigo-500 hover:border-indigo-500 flex items-center justify-center gap-2" onClick={handleCopyToClipboard}>
            <Copy className='text-green-500'/>
            <span className="text-green-500">Copiado!</span>
          </Button>
        ) : (
          <Button className="size-13 border border-zinc-500 hover:text-indigo-500 hover:border-indigo-500" onClick={handleCopyToClipboard}>
            <Copy/>
          </Button>
        )}
        </>
      )}
    </>
  )
}

export default RepositoryClone