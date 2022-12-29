import { useEffect, useState } from 'react';
import './App.css';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null)

  const checkIfWalletIsConnected = async() =>{
    try {
      const { solana } = window;
      if(solana){
        if(solana.isPhantom){
          console.log("Phantom wallet found !")
          const response = await solana.connect({
            onlyIfTrusted: true,
          });
          console.log("Connected to public key : ", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString())
        }
      }else{
        alert("Solana Object not found ! Get a Phantom wallet")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async() => {
    const {solana} = window;
    if(solana){
      const response = await solana.connect();
      console.log("Connected to public key : ", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString())
    }
  }

  const renderNotConnectedContainer = () => {
    return <Box sx={{marginX: '0', paddingLeft: '0'}}>
    <Box sx={{ bgcolor: '#1f2842', height: '100vh' , width: '100vw', display: 'flex',justifyContent:'center' , flexDirection: 'column'}}>
      <Box sx={{ bgcolor: '#1f2839', height: '20vh' , width: '40vw' , alignSelf:'center', borderRadius:'1.2rem', display: 'flex',flexDirection: 'column',justifyContent:'center'}}>
        <Typography variant="h3" gutterBottom sx={{color:'#ffefff', alignSelf:'center',fontWeight:'100'}}>
          Solana Crowdfunding
        </Typography>
        <Button variant="outlined" sx={{width:'190px',height: '50px', alignSelf:'center', borderRadius:'0.75rem', marginTop:'10px'}} onClick={connectWallet}>
          Connect Wallet
        </Button>
      </Box>
    </Box>
    </Box>
  }

  const renderConnectedContainer = () => {

  }

  useEffect(()=>{
    const onLoad = async() => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  },[])
  
  return (
    <div>
      {!walletAddress && renderNotConnectedContainer()}
    </div>
  );
}

export default App;
