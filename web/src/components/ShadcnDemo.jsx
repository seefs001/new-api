import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

import { Button } from './ui/button';
import { Input } from './ui/input';
import React from 'react';

const ShadcnDemo = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Shadcn UI Components Demo</h1>
      
      <Tabs defaultValue="buttons" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="inputs">Inputs & Select</TabsTrigger>
          <TabsTrigger value="dialogs">Dialogs & Dropdowns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buttons">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button variations</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the main content of the card.</p>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost">Cancel</Button>
                <Button>Submit</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
                <CardDescription>With different content</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cards can be used for various UI patterns.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Full Width Button</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inputs">
          <Card>
            <CardHeader>
              <CardTitle>Inputs & Selects</CardTitle>
              <CardDescription>Form controls demonstration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Input</label>
                <Input placeholder="Enter your name" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Email Input</label>
                <Input type="email" placeholder="email@example.com" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Select Option</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="grape">Grape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="dialogs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dialog</CardTitle>
                <CardDescription>Modal dialog example</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        This is a dialog window that can be used to show important information.
                      </DialogDescription>
                    </DialogHeader>
                    <p className="py-4">Dialog content goes here. You can put any content you want.</p>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu</CardTitle>
                <CardDescription>Dropdown menu example</CardDescription>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Activity</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted p-4 rounded-md mt-8">
        <h2 className="font-medium mb-2">Using Shadcn UI Components</h2>
        <p>This is a demonstration of Shadcn UI components in JavaScript. You can find all these components in the <code>src/components/ui</code> directory.</p>
      </div>
    </div>
  );
};

export default ShadcnDemo; 