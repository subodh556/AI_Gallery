"use client"

import axios from "axios";
import * as z from "zod";
import {Heading} from "@/components/heading";
import { Video, VideoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useProModal } from "@/hooks/use-pro-modal";

import { formSchema } from "./constants";
import { useState } from "react";
import toast from "react-hot-toast";
// Define the type inline since "openai" does not export it

const VideoPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [video, setVideo] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            setVideo(undefined);
            const response = await axios.post("/api/video",values);
            setVideo(response.data[0]);
            form.reset();

        }catch(error:any){
            if(error?.response?.status === 403){
                proModal.onOpen();
            }
            else{
                toast.error("Something went wrong.");
            }
        }finally{
            router.refresh();
        }
    }

  return (
    <div>
        <Heading
            title="Video Generation"
            description="Turn your prompt into Video."
            icon={VideoIcon}
            iconColor="text-orange-700"
            bgColor="bg-orange-700/10"
        />
        <div className="px-4 lg:px-8">
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2">
                        <FormField name="prompt" render={({ field }) => (
                            <FormItem className="col-span-12 lg:col-span-10">
                                <FormControl className="m-0 p-0">
                                    <Input
                                        {...field}
                                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                        disabled={isLoading}
                                        placeholder="Clown fish swimming in a tank"
                                    />
                                </FormControl>
                            </FormItem>
                        )} /> 
                        <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                        Generate
                        </Button>
                    </form>
                </Form>
            </div>
            <div className="space-y-4 mt-4">
                {isLoading && (
                    <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                        <Loader />
                    </div>
                )}
                {!video && !isLoading && (
                    <Empty label="No video generated." />
                )}
             {video && (
                    <video className="w-full aspect-video mt-8 rounded-lg border bg-black" controls>
                            <source src={video} />
                    </video>
                )}
            </div>
        </div>

    </div>
  )
}

export default VideoPage;