"use client"
import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { Dna } from 'react-loader-spinner';
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
        <div className='w-screen h-screen flex flex-col justify-between items-center bg-slate-800'>
            <span className='text-4xl mt-10'>My Personnal Assistant</span>
            <div className='text-white bg-black rounded-2xl w-full h-full mt-10 mr-10 ml-10 max-w-3xl flex flex-col justify-stretch items-center overflow-scroll'>
                {conversation.map(({ from, message }: Message, i: number) => {
                    return from === 'User'
                        ? (
                            <div key={i} className='bg-slate-700 p-4 w-full border-b border-b-slate-800 '>
                                {message}
                            </div>
                        ) : (
                            <div key={i} className='p-4'>{message}</div>
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


            <div className='flex gap-4 p-10 w-10/12 max-w-3xl'>
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
                    className='bg-slate-600 p-4 px-6 rounded-2xl'
                >
                    Go
                </button>
            </div>
        </div>
    )
}

export default Chat