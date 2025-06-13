'use client'
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import Image from 'next/image'
interface historyProps {
    historyOpen: boolean;
    setHistoryOpen: (open: boolean) => void;
}

interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: Date;
  preview: string;
  tags: string[];
}

const History : React.FC<historyProps> = ({ historyOpen, setHistoryOpen }) =>  {
      const [projects] = useState<Project[]>([
        {
          id: "1",
          name: "Landing Page",
          description: "Modern landing page with hero section",
          lastModified: new Date(Date.now() - 1000 * 60 * 30),
          preview: "/placeholder.svg?height=200&width=300",
          tags: ["React", "Tailwind", "Landing"],
        },
        {
          id: "2",
          name: "Dashboard",
          description: "Analytics dashboard with charts",
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
          preview: "/placeholder.svg?height=200&width=300",
          tags: ["Dashboard", "Charts", "Analytics"],
        },
        {
          id: "3",
          name: "E-commerce",
          description: "Product catalog with shopping cart",
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
          preview: "/placeholder.svg?height=200&width=300",
          tags: ["E-commerce", "React", "Shopping"],
        },
      ]);
  return (
    <div>{historyOpen && (
              <div className="w-80 border-l bg-card/50 backdrop-blur-sm animate-in slide-in-from-right-2 duration-300 h-full overflow-y-auto flex-shrink-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent Projects</h3>
                    <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(false)}>
                      ×
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <Card key={project.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                              <Image
                                src={project.preview || "/placeholder.svg"}
                                alt={project.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{project.name}</h4>
                              <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                              <div className="flex gap-1 mt-2">
                                {project.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}</div>
  )
}

export default History