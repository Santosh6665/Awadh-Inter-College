'use client';

import { useState, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { facultyDirectory } from '@/lib/data';

export function FacultyDirectory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaculty = useMemo(() => {
    return facultyDirectory.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-accent" />
          Faculty Directory
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or department..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-64 overflow-auto pr-2">
          {filteredFaculty.map((member) => (
            <div key={member.id} className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${member.email}.png`} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1 text-sm">
                <p className="font-semibold">{member.name}</p>
                <p className="text-muted-foreground">{member.department} - {member.title}</p>
                <p className="text-muted-foreground">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
