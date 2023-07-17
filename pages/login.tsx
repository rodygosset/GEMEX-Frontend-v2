import FieldContainer from "@components/form-elements/field-container"
import Label from "@components/form-elements/label"
import TextInput from "@components/form-elements/text-input"
import { faGem, faRightToBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/pages/login.module.scss"
import { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { FormEvent, FormEventHandler, useEffect, useState } from "react"

import { signIn, useSession } from "next-auth/react"
import Button from "@components/button"


const Login: NextPage = () => {

    const router = useRouter()

    const callbackUrl = router.query.callbackUrl?.toString() || '/';

    // if the user's already authenticated, redirect to returnUrl

    const { status } = useSession()

    useEffect(() => {

        if(status == "authenticated") {
            router.push(callbackUrl)
        }

    }, [status])

    // state

    const [username, setUserName] = useState('')
    const [password, setPassword] = useState('')

    const [signInFailed, setSignInFailed] = useState(false)

    const handleSubmit = async (event: FormEvent | MouseEvent) =>{
        event.preventDefault()
        signIn(
            "credentials", 
            { 
                username: username, 
                password: password, 
                redirect: false
            }
        ).then(response => {
            console.log("response", response)
            if(!response?.ok) setSignInFailed(true)
        })
    }

    return (
        <main id={styles.container}>
            <Head>
                <title>Se connecter</title>
                <meta 
                    name="description" 
                    content="Page de connexion à l'application GEMEX" 
                />
            </Head>
            <section id={styles.loginForm}>
                <section id={styles.greeting}>
                    <h2>Vous revoilà !</h2>
                    <p>Connectez-vous avec votre nom d&apos;utilisateur et votre matricule.</p>
                </section>
                <form 
                    name="login" 
                    onSubmit={(handleSubmit as FormEventHandler)}>
                    <FieldContainer fullWidth>
                        <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                        <TextInput 
                            placeholder="Entrez votre nom d'utilisateur"
                            onChange={setUserName}
                            name={"username"}
                            currentValue={username}
                            bigPadding
                            fullWidth
                        />
                    </FieldContainer>
                    <FieldContainer fullWidth>
                        <Label htmlFor="password">Matricule</Label>
                        <TextInput 
                            placeholder="Entrez votre matricule"
                            onChange={setPassword}
                            name={"password"}
                            currentValue={password}
                            bigPadding
                            password
                            fullWidth
                        />
                    </FieldContainer>
                    <Button 
                        icon={faRightToBracket}
                        type="submit"
                        onClick={handleSubmit}
                        fullWidth
                    >
                        Se connecter
                    </Button>
                </form>
                <p className={styles.error + (signInFailed ? ' ' + styles.showError : '')}>Nom d'utilisateur ou mot de passe incorrect</p>
            </section>
            <section id={styles.hero}>
                <div className={styles.appName}>
                    <FontAwesomeIcon icon={faGem}/>
                    <h1>GEMEX</h1>
                    <p>Gestion, exploitation et maintenance des expositions</p>
                </div>
                <section id={styles.illustrationContainer}>
                    <Image 
                        quality={100}
                        src={'/images/project-team.svg'} 
                        alt={"Illustration d'une équipe projet en action."} 
                        priority
                        fill
                        style={{ 
                            objectFit: "contain", 
                            top: "auto"
                        }}
                    />
                </section>
            </section>
            
        </main>
    )
}

export default Login