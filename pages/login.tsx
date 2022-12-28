import styles from "@styles/pages/Login.module.scss"
import { NextPage } from "next"

const Login: NextPage = () => {



    return (
        <div className={styles.container}>
            <div className={styles.login}>
                <div className={styles.greeting}>
                    <h1>Vous revoilà !</h1>
                    <p>Connectez-vous avec votre nom d'utilisateur et votre matricule.</p>
                </div>
            </div>
            <div className={styles.hero}>

            </div>
            
        </div>
    )
}

export default Login