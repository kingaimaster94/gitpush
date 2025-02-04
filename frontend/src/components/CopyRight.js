import { Box, Typography } from '@mui/material'
import React from 'react'

const CopyRight = () => {
  return (
    <Box sx={{
        my:"2rem",
        background:"#152A29",
        borderRadius:"100px",
        padding:{sm:"25px 60px",xs:"20px 30px"},
        display:"flex",
        justifyContent:{sm:"space-between",xs:"center"},
        gap:"1rem",
        flexWrap:"wrap",
        "& p":{
            fontFamily:"JostRegular",
            fontSize:{sm:"16px",xs:"15px"},
            color:"#DCDCDC"
        }
    }}>
    <Typography>
    @2024 All rights reserved
    </Typography>
    <Typography>
    Privacy Policy
    </Typography>
    <Typography>
    Terms & Conditions
    </Typography>
    </Box>
  )
}

export default CopyRight