'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProductTabs({ description, reviewsComponent }) {

  return (
    <div className="mt-12 max-w-[1280px] mx-auto w-full px-4 md:px-8">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start border-b border-gray-200 rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="description"
            className="py-3 px-6 text-sm font-semibold rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#0066cc] data-[state=active]:text-[#0066cc] data-[state=active]:shadow-none text-gray-500 hover:text-gray-900"
          >
            Description
          </TabsTrigger>
          <TabsTrigger 
            value="reviews"
            className="py-3 px-6 text-sm font-semibold rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#0066cc] data-[state=active]:text-[#0066cc] data-[state=active]:shadow-none text-gray-500 hover:text-gray-900"
          >
            Reviews
          </TabsTrigger>
        </TabsList>

        <div className="border border-gray-200 border-t-0 p-6 md:p-10 bg-white min-h-[300px]">
          <TabsContent value="description" className="mt-0 outline-none">
            <div className="text-sm text-gray-600 leading-relaxed max-w-none whitespace-pre-wrap">
              {description}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-0 outline-none animate-in fade-in duration-500">
            {reviewsComponent}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
