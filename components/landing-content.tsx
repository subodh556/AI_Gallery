"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const testimonails = [
  {
    name: "Rajesh",
    avatar: "R",
    title: "Software Engineer",
    description: "This is the best application I've ever used!",
  },
  {
    name: "Jhetalal Gada",
    avatar: "R",
    title: "Software Engineer",
    description: "Best AI application I've ever used!",
  },
  {
    name: "Champaklal Gada",
    avatar: "S",
    title: "Graphic Designer",
    description: "The AI Generated content is amazing!",
  },
  {
    name: "Lakshman",
    avatar: "L",
    title: "AI Engineer",
    description: "The UI is so intuitive and easy to use!",
  }

]

export const LandingContent = () => {
  return (
    <div className="px-10 pb-20">
      <h2 className="text-center text-4xl text-white font-extrabold mb-10">Testimonials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {testimonails.map((item) => (
          <Card key={item.description} className="bg-[#192339] border-none text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2">
                <div>
                  <p className="text-lg">{item.name}</p>
                  <p className="text-zinc-400 text-sm">{item.title}</p>
                </div>
              </CardTitle>
              <CardContent className="pt-4 px-0">
                {item.description}
              </CardContent>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}