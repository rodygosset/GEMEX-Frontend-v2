import FieldContainer from "@components/form-elements/field-container"
import Label from "@components/form-elements/label"
import SubmitButton from "@components/form-elements/submit-button"
import TextInput from "@components/form-elements/text-field"
import { faGem, faRightToBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/pages/login.module.scss"
import { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { FormEvent, FormEventHandler, MouseEventHandler, useState } from "react"

import { signIn, useSession } from "next-auth/react"


const Login: NextPage = () => {

    const router = useRouter()

    let returnUrl = router.query.returnUrl?.toString() || '/';

    // if the return url is /login, change it to the home page
    if(returnUrl == "/login") { returnUrl = '/'; }


    // if the user's already authenticated, redirect to returnUrl

    const { status } = useSession()

    if(status == "authenticated") {
        router.push(returnUrl)
    }

    // state

    const [username, setUserName] = useState('')
    const [password, setPassword] = useState('')

    const [signInFailed, setSignInFailed] = useState(false)

    type FormSubmitHandler = FormEventHandler<HTMLFormElement> | MouseEventHandler<HTMLInputElement>

    const handleSubmit: FormSubmitHandler = async (event: FormEvent | MouseEvent) =>{
        event.preventDefault()
        signIn(
            "credentials", 
            { 
                username: username, 
                password: password, 
                redirect: false
            }
        ).then((response) => {
            if(!response) return
            const { ok, error } = response
            ok ? router.push(returnUrl) : setSignInFailed(true)
        })
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Se connecter</title>
                <meta name="description" content="Page de connexion à l'application GEMEX" />
            </Head>
            <div className={styles.login}>
                <div className={styles.greeting}>
                    <h2>Vous revoilà !</h2>
                    <p>Connectez-vous avec votre nom d&apos;utilisateur et votre matricule.</p>
                </div>
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
                    <SubmitButton 
                        value={"Se connecter"} 
                        icon={faRightToBracket}
                        onSubmit={(handleSubmit as MouseEventHandler)}
                        fullWidth
                    />
                </form>
                <p className={styles.error + (signInFailed ? ' ' + styles.showError : '')}>Nom d'utilisateur ou mot de passe incorrect</p>
            </div>
            <div className={styles.hero}>
                <div className={styles.appName}>
                    <FontAwesomeIcon icon={faGem}/>
                    <h1>GEMEX</h1>
                    <p>Gestion, exploitation et maintenance des expositions</p>
                </div>
                <div className={styles.illustrationContainer}>
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
                </div>
            </div>
            
        </div>
    )
}

export default Login