import React from 'react';

export function NavLinks() {
    return (
        <div className="hidden items-center gap-4 mr-4 md:flex">
            <a
                href="https://github.com/OpenHealthForAll/open-health"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium"
            >
                Github
            </a>
            <a
                href="https://www.reddit.com/r/AIDoctor/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium"
            >
                Reddit
            </a>
            <a
                href="https://discord.gg/B9K654g4wf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium"
            >
                Discord
            </a>
        </div>
    );
}
