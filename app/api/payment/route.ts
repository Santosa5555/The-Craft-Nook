import axios from "axios";
import { NextRequest,NextResponse } from "next/server";

export const POST=async (req:NextRequest)=>{
    try {
        const body =await req.json()
        const response=await axios.post(`${process.env.NEXT_PUBLIC_KHALTI_URL}/epayment/initiate/`,
            body,
            {
            headers:{
                'Authorization':`Key ${process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
            
        })
        return NextResponse.json(response.data)
    } catch (error:unknown) {
        return NextResponse.json({error:error instanceof Error ? error.message : 'Internal server error'}, {status:500})
        
    }

}