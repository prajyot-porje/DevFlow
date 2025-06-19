'use client'

import { SignedIn, UserButton } from '@clerk/nextjs'
import { Avatar } from '@radix-ui/react-avatar'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Bell, Moon, Search, Sun } from 'lucide-react'
import { Badge } from '../ui/badge'
import { useTheme } from 'next-themes'

const Header = ({ title }: { title: string }) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Delay rendering until mounted (client only)
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="font-semibold">{title}</h2>
                <Badge variant="secondary" className="animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Online
                </Badge>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                    <Bell className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {mounted && theme === "dark" ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </Button>
                <Avatar className="w-8 h-8">
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </Avatar>
            </div>
        </header>
    );
};

export default Header;
