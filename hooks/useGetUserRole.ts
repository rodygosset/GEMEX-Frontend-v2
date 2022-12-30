import { UserRole } from "@conf/api/data-types/user"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"
import useAPIRequest from "./useAPIRequest"

// return a function
// that allows components to retrieve information about the User's permissions

const useGetUserRole = () => {

    const session = useSession()?.data as MySession

    // get the user's role from the API

    const makeAPIRequest = useAPIRequest()

    return async () => {

        return makeAPIRequest<UserRole, UserRole>(
            "get",
            "roles",
            `id/${session.user.role_id}`,
            undefined,
            res => res.data
        )

    }
}

export default useGetUserRole