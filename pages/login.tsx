import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/radix/form";
import { Input } from "@components/radix/input";
import { faGem } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";


const formSchema = z.object({
    username: z.string().min(3, {
        message: "Le nom d'utilisateur doit contenir au moins 3 caractères."
    }),
    password: z.string().min(4, {
        message: "Le mot de passe doit contenir au moins 4 caractères."
    })
})


const LoginPage: NextPage = () => {

    // routing logic

    const router = useRouter()

    const callbackUrl = router.query.callbackUrl?.toString() || '/';

    // if the user's already authenticated, redirect to returnUrl

    const { status } = useSession()

    useEffect(() => {

        if(status == "authenticated") {
            router.push(callbackUrl)
        }

    }, [status])

    // form state

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    })


    // handle submit

    const [signInFailed, setSignInFailed] = useState(false)

    const SubmitHandler = async () => {
        signIn(
            "credentials", 
            { 
                username: form.getValues('username'), 
                password: form.getValues('password'),
                redirect: false
            }
        ).then(response => {
            console.log("response", response)
            if(response?.ok) window.location.replace(callbackUrl)
            else setSignInFailed(true)
        })
    }


    // render

    return (
        <main 
            id="main-login"
            className="w-screen h-screen flex justify-center items-center pb-0 bg-slate-900">
            <div className="w-full h-full sm:p-[64px] bg-[url('/images/login-bg.jpg')] bg-cover bg-center bg-no-repeat
                            flex justify-center items-center gap-[32px]">
                <section className="h-full flex-1 flex flex-col justify-center gap-0 max-lg:hidden">
                    <span className="flex items-center gap-4">
                            <FontAwesomeIcon icon={faGem} className="text-base text-white" />
                            <span className="text-xl font-normal text-white">GEMEX</span>
                    </span>
                    <div className="h-full flex flex-col justify-center gap-0">
                        <h1 className="text-3xl font-semibold text-white ">
                            Gestion de l'exploitation
                        </h1>
                        <p className="text-base font-normal text-white/60">et de la maintenance technique des expositions à Universcience</p>
                    </div>
                </section>
                <section className="h-full flex-1 sm:rounded-[8px] bg-white/10 backdrop-blur-3xl  gap-[16px] shadow-2xl
                                    flex flex-col p-[64px]">
                    <span className="flex items-center gap-4 lg:hidden">
                            <FontAwesomeIcon icon={faGem} className="text-base text-white" />
                            <span className="text-xl font-normal text-white">GEMEX</span>
                    </span>
                    <Form {...form}>
                        <form 
                            className="flex-1 flex flex-col justify-center gap-[64px]"
                            onSubmit={form.handleSubmit(SubmitHandler)}>
                            <div className="flex flex-col w-full">
                                <h2 className="text-3xl font-semibold text-white">Vous revoilà</h2>
                                <p className="text-base font-normal text-white/60">Connectez-vous avec votre nom d'utilisateur et votre matricule.</p>
                            </div>

                            <div className="flex flex-col gap-[32px]">
                                <FormField 
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/80 text-base font-normal">
                                                Nom d'utilisateur
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-white/60 text-sm font-normal">
                                                Votre nom d'utilisateur est votre prénom suivi de votre nom de famille.
                                            </FormDescription>
                                            <FormMessage className="text-red-400 text-sm font-normal"/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/80 text-base font-normal">
                                                Matricule
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-white/60 text-sm font-normal">
                                                Votre matricule est votre numéro de badge.
                                            </FormDescription>
                                            <FormMessage className="text-red-400 text-sm font-normal">
                                                { signInFailed && "Nom d'utilisateur ou matricule incorrect." }
                                            </FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <button 
                                className="w-full rounded-[8px] bg-blue-600 text-white text-sm font-normal p-[16px]
                                            hover:bg-blue-700 transition duration-300 ease-in-out"
                                onClick={form.handleSubmit(SubmitHandler)}>
                                Se connecter
                            </button>
                        </form>
                    </Form>
                </section>
            </div>
        </main>
    )
}

export default LoginPage