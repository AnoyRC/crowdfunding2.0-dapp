import { useEffect, useState } from 'react';
import './App.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import { Connection, clusterApiUrl, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import {Program, AnchorProvider, web3, BN,utils} from '@project-serum/anchor';
import {idl} from './idl.js'
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');

const opts = {
  preFlightCommitment : 'processed'
}

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null)
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [toggle, setToggle] = useState(false);
  const [campaigns, setCampaigns] = useState();

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

  const getProvider = () =>{
    const connection = new Connection(network, opts.preFlightCommitment)
    const provider = new AnchorProvider(connection, window.solana, opts.preFlightCommitment)
    return provider;
  }

  const getCampaign = async() => {
    const connection = new Connection(network, opts.preFlightCommitment);
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    Promise.all(
      (await connection.getProgramAccounts(programID)).map(async(campaign)=>  ({
        ...(await program.account.campaign.fetch(campaign.pubkey)),
        pubkey: campaign.pubkey
      }))).then((campaign)=> {
        setCampaigns(campaign)
        console.log(campaign)
      })
  }

  const addCampaign = async(event) => {
    event.preventDefault();
    const re = /^[0-9\b]+$/;
    if(name.length > 0 && desc.length > 0 && amount.length > 0 && re.test(amount) && amount !== 0){
      try {
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        const [ campaign ] = await PublicKey.findProgramAddressSync(
          [
            utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
            provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        )
        await program.rpc.create(name,desc,new BN(amount*web3.LAMPORTS_PER_SOL),{
          accounts:{
            campaign,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId
          }
        })
        console.log('Successfully created a campaign')
        console.log(name,desc,amount);
        getCampaign()
        setName('');
        setDesc('');
        setAmount(0);
      } catch (error) {
        console.log('Error Creating Campaign',error)
      }
      
    }else{
      console.log('Enter a valid input !')
    }
  }

  const toggleForm = () => {
    setToggle(!toggle);
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
    return <Box sx={{marginX: '0', paddingLeft: '0',height:'100vh', bgcolor: '#1f2842'}}>
    <Box sx={{ bgcolor: '#1f2842' , width: '100vw', display: 'flex', flexDirection: 'column'}}>
      <Box sx={{ bgcolor: '#1f2839', height: '20vh' , width: '40vw' , alignSelf:'center', borderRadius:'1.2rem', display: 'flex',flexDirection: 'column',justifyContent:'center', marginTop:'20px'}}>
        <Typography variant="h3" gutterBottom sx={{color:'#ffefff', alignSelf:'center',fontWeight:'100'}}>
          Solana Crowdfunding
        </Typography>
        <Button variant="outlined" sx={{width:'190px',height: '50px', alignSelf:'center', borderRadius:'0.75rem', marginTop:'10px'}} onClick={toggleForm}>
          {(!toggle && 'Add Campaign') || 'X'}
        </Button>
      </Box>
      {toggle &&
      <Box component='form' onSubmit={addCampaign} noValidate sx={{ bgcolor: '#1f2839', height: '35vh' , width: '40vw' , alignSelf:'center', borderBottomLeftRadius:'1.2rem',borderBottomRightRadius:'1.2rem', display: 'flex',flexDirection: 'column',justifyContent:'center',marginTop:'-10px'}}>
        <TextField value={name} onChange={(e)=>setName(e.target.value)} label="Campaign Name" id="outlined-size-normal" sx={{ width:'80%', alignSelf:'center',marginBottom:'20px',
        input: { color: 'white' },
        "& .MuiInputLabel-root": {color: 'white'},
        "& .MuiOutlinedInput-root": { "& > fieldset": { borderColor: "white" }},
        "& .MuiOutlinedInput-root.Mui-focused": {
          "& > fieldset": {borderColor: "white"}
        },
        "& .MuiOutlinedInput-root:hover": {
          "& > fieldset": { borderColor: "white"}
        }}}  />
        <TextField value={desc} onChange={(e)=>setDesc(e.target.value)} label="Description" id="outlined-size-normal" sx={{ width:'80%',alignSelf:'center',marginBottom:'20px',
        input: { color: 'white' },
        "& .MuiInputLabel-root": {color: 'white'},
        "& .MuiOutlinedInput-root": { "& > fieldset": { borderColor: "white" }},
        "& .MuiOutlinedInput-root.Mui-focused": {
          "& > fieldset": {borderColor: "white"}
        },
        "& .MuiOutlinedInput-root:hover": {
          "& > fieldset": { borderColor: "white"}
        }}}  />
        <TextField value={amount} onChange={(e)=>setAmount(e.target.value)} label="Amount" id="outlined-size-normal" sx={{ width:'80%',alignSelf:'center',marginBottom:'20px',
        input: { color: 'white' },
        "& .MuiInputLabel-root": {color: 'white'},
        "& .MuiOutlinedInput-root": { "& > fieldset": { borderColor: "white" }},
        "& .MuiOutlinedInput-root.Mui-focused": {
          "& > fieldset": {borderColor: "white"}
        },
        "& .MuiOutlinedInput-root:hover": {
          "& > fieldset": { borderColor: "white"}
        }}}  />
        <Button type='submit' variant="outlined" sx={{width:'190px',height: '50px', alignSelf:'center', borderRadius:'0.75rem', marginTop:'10px'}}>
          Add
        </Button>
      </Box>
      }
      {campaigns && campaigns.map((campaign,index)=>(
        <Post key={index}
          title={campaign.name} 
          desc={campaign.description}
          max={campaign.maxAmount.toString() / web3.LAMPORTS_PER_SOL}
          admin= {campaign.admin.toString()}
          donated= {campaign.amountDonated.toString() / web3.LAMPORTS_PER_SOL}
          left= {campaign.amountLeft.toString() / web3.LAMPORTS_PER_SOL}
          pubkey= {campaign.pubkey}
          active = {campaign.active}
        />
      ))}
    </Box>
    </Box>
  }

  const Post = (props) => {
    return(
      <Box sx={{ bgcolor:props.active ? '#1f2839' : '#2d3f59', height: '30vh' , width: '40vw' , alignSelf:'center', borderRadius:'1.2rem', display: 'flex', marginY:'20px'}}>
        <Box sx={{height:'100%',display:'flex', flexDirection:'column',width:'65%'}}>
          <Typography variant="h3" gutterBottom sx={{color:'#ffefff',fontWeight:'100', marginTop:'20px', marginLeft:'20px',marginBottom:'0px'}}>
            {props.title}
          </Typography>
          <Typography variant="h5" gutterBottom sx={{color:'#c4c4c4',fontWeight:'100', marginTop:'10px', marginLeft:'20px',marginBottom:'13px'}}>
            {props.desc}
          </Typography>
          <Box sx={{display:'flex',alignItems:'center',height:'100%'}}>
              <Box sx={{height:'100%',width:'50%',display:'flex', justifyContent:'center', alignContent:'center', bgcolor:'#181f2b',borderRadius:'1.2rem',marginX:"5px",marginLeft:'15px'}}>
                <Typography variant="h5" gutterBottom sx={{color:'#c4c4c4',fontWeight:'100', marginTop:'10px', marginLeft:'3px',alignSelf:'center'}}>
                  Amount Donated <br />
                  {props.donated}
                </Typography>
              </Box>
              <Box sx={{height:'100%',width:'50%',display:'flex',justifyContent:'center',alignContent:'center', bgcolor:'#181f2b',borderRadius:'1.2rem',marginX:"5px"}}>
                <Typography variant="h5" gutterBottom sx={{color:'#c4c4c4',fontWeight:'100', marginTop:'10px', marginLeft:'3px',alignSelf:'center'}}>
                  Target Amount <br />
                  {props.max}
                </Typography>
              </Box>
            </Box>
          <Box sx={{display:'flex', height:'50%',width:'100%'}}>
            <LinearProgressWithLabel value={props.donated/props.max >= 1 ? 100 : props.donated/props.max * 100} sx={{marginLeft: '20px'}}/>
          </Box>
        </Box>
        <Box sx={{height:'100%',width:'35%',display:'flex', alignContent:'center',justifyContent:'center'}}>
          <Box sx={{height:'90%', width:'90%',bgcolor:'#181f2b',alignSelf:'center',borderRadius:'0.65rem',display:'flex', flexDirection:'column', justifyContent:'center'}}>
            {(props.donated < props.max &&
              <Button variant="outlined" sx={{marginY:'5%',width:'85%',alignSelf:'center',height:'30%',borderRadius:'0.65rem'}} onClick={()=>donate(props.pubkey)}>Donate</Button>) ||
              <Button variant="outlined" sx={{marginY:'5%',width:'85%',alignSelf:'center',height:'30%',borderRadius:'0.65rem',bgcolor:'#aba8a7'}} disabled>Donate</Button>}
            {(props.left > 0 &&
              <Button variant="outlined" sx={{marginY:'5%',width:'85%',alignSelf:'center',height:'30%',borderRadius:'0.65rem'}} onClick={()=>withdraw(props.pubkey)}>Withdraw</Button>) ||
              <Button variant="outlined" sx={{marginY:'5%',width:'85%',alignSelf:'center',height:'30%',borderRadius:'0.65rem',bgcolor:'#aba8a7'}} disabled>Withdraw</Button>}
            {(props.active && 
              <Button variant="outlined" sx={{marginY:'5%',width:'85%',alignSelf:'center',height:'30%',borderRadius:'0.65rem'}} onClick={()=>deleteCampaign(props.pubkey)}>Drop Campaign</Button>) ||
              <Button variant="outlined" sx={{marginY:'5%',width:'85%',alignSelf:'center',height:'30%',borderRadius:'0.65rem',bgcolor:'#aba8a7'}} disabled>Drop Campaign</Button>}
          </Box>
        </Box>
      </Box>
    );
  }

  const donate = async(pubkey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.donate(new BN(2*web3.LAMPORTS_PER_SOL),{
        accounts:{
          campaign: pubkey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        }
      })
      console.log('Successfully donated the campaign')
      getCampaign();
    } catch (error) {
      console.log('Error Donating', error)
    }
  }

  const withdraw = async(pubkey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.withdraw({
        accounts:{
          campaign: pubkey,
          user: provider.wallet.publicKey,
        }
      })
      console.log('Successfully withdrawn the campaign')
      getCampaign();
    } catch (error) {
      console.log('Error Donating', error)
    }
  }

  const deleteCampaign = async(pubkey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.withdraw({
        accounts:{
          campaign: pubkey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        }
      })
      console.log('Successfully dropped the campaign')
      getCampaign();
    } catch (error) {
      console.log('Error Donating', error)
    }
  }

  useEffect(()=>{
    const onLoad = async() => {
      await checkIfWalletIsConnected()
    }
    getCampaign();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  },[])

  function LinearProgressWithLabel(props) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' ,width:'100%',alignSelf:'flex-end',marginBottom:'15px'}}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary" sx={{color:'#ffefff'}}>{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }
  
  return (
    <div>
      {(!walletAddress && renderNotConnectedContainer()) || renderConnectedContainer()}
    </div>
  );
}

export default App;
