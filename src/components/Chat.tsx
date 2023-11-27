"use client"
import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { Dna } from 'react-loader-spinner';
import Image from 'next/image'
const socket = io('http://localhost:3000', {
    autoConnect: false
});
type Message = {
    from: 'User' | 'AI';
    message: string;

}
const Chat = (): JSX.Element => {
    const [prompt, setPrompt] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [conversation, setConversation] = useState<Message[]>([])

    const ref = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        socket.connect()
        return () => {
            socket.disconnect();
        };
    }, [])

    useEffect(() => {
        ref.current?.scrollIntoView({
            behavior: "smooth",
            block: 'end'
        })
    }, [conversation])
    socket.on('response', (response) => {
        setIsLoading(false)

        setConversation(conversation.map((convMessage: Message, i: number, arr: Message[]) => {
            if (i === arr.length - 1) {
                return { ...convMessage, message: response }
            } else {
                return convMessage
            }
        }))
    })

    function sendPrompt() {
        setIsLoading(true)
        socket.emit('prompt', prompt)
        setConversation((prevMessages) => [...prevMessages, {
            from: 'User',
            message: prompt
        }, { from: 'AI', message: '' }])
        setPrompt('')
    }

    return (
        <div className='font-poppins w-screen h-screen flex flex-col justify-between items-center bg-gradient-to-b from-black to-blue-950 px-10'>
            <span className='text-4xl mt-10 font-extralight w-full text-center'>My Personnal Assistant</span>
            <div className='text-white bg-slate-900 shadow-lg rounded-2xl w-full h-full mt-10  max-w-3xl flex flex-col justify-stretch items-center overflow-scroll'>
                {conversation.map(({ from, message }: Message, i: number) => {
                    return from === 'User'
                        ? (
                            <div key={i} className='bg-slate-800 p-4 w-full border-b border-b-slate-800 '>
                                <div className='flex justify-start gap-2 items-center mb-3'>
                                    <Image src='/djovap.com.png' width={30} height={30} alt='djovap logo' />
                                    <div className='text-xs text-slate-400'>{from}</div>
                                </div>
                                <div>{message}</div>
                            </div>
                        ) : (
                            <div key={i} className=' p-4 w-full '>
                                <div className='flex justify-end gap-2 items-center mb-3'>
                                    <div className='text-xs text-slate-400'>{from}</div>
                                    <div className='rounded-full overflow-hidden'>
                                        <Image src='/llama2-logo.png' width={30} height={30} alt='djovap logo' />
                                    </div>
                                </div>
                                <div>{message}</div>
                            </div>
                        )

                })}
                <div ref={ref}>
                    <Dna
                        visible={isLoading}
                        height="80"
                        width="80"
                        ariaLabel="dna-loading"
                        wrapperStyle={{}}
                        wrapperClass="dna-wrapper"
                    />
                </div>
            </div>


            <div className='flex gap-4 py-10 w-full max-w-3xl'>
                <input
                    type="text"
                    placeholder='Ask me a question'
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
                    value={prompt}
                    className='text-white border border-slate-400 w-full h-16 p-4 rounded-2xl bg-transparent'
                />
                <button
                    onClick={() => sendPrompt()}
                    className='bg-black text-slate-400 p-4 px-6 rounded-2xl'
                >
                    Go
                </button>
            </div>
        </div>
    )
}

export default Chat