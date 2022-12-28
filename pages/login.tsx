import PrimaryCTA from "@components/buttons/primary-cta"
import FieldContainer from "@components/form-elements/field-container"
import Label from "@components/form-elements/label"
import SubmitButton from "@components/form-elements/submit-button"
import TextInput from "@components/form-elements/text-field"
import { faGem, faRightToBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/pages/Login.module.scss"
import { NextPage } from "next"
import Image from "next/image"
import { FormEvent, FormEventHandler, MouseEventHandler, useState } from "react"

const Login: NextPage = () => {

    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit: FormEventHandler<HTMLFormElement> | MouseEventHandler<HTMLInputElement> = (event: FormEvent | MouseEvent) =>{
        event.preventDefault()
    }

    return (
        <div className={styles.container}>
            <div className={styles.login}>
                <div className={styles.greeting}>
                    <h2>Vous revoilà !</h2>
                    <p>Connectez-vous avec votre nom d'utilisateur et votre matricule.</p>
                </div>
                <form name="login" onSubmit={(handleSubmit as FormEventHandler)}>
                    <FieldContainer fullWidth>
                        <Label htmlFor="username">Nom d'utilisateur</Label>
                        <TextInput 
                            placeholder="Entrez votre nom d'utilisateur"
                            onChange={setUserName}
                            name={"username"}
                            currentValue={userName}
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