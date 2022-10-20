import { NextApiRequest, NextApiResponse } from "next";
import { validatRoute} from "../../lib/auth";

export default validatRoute((req: NextApiRequest, res: NextApiResponse, user) => {
    res.json(user)
})