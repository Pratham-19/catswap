const serverUrl = "https://evm1bek9ggpr.usemoralis.com:2053/server";
const appId = "14JIGnoQZf2KUCcLJefuE8afRLh89GbDAs711LuR";
Moralis.start({ serverUrl, appId });
let tokenTrade={};
let tokenSelectSide;
let tokens;
var type_timer;
var user;
let userAddress;
let chain="eth;"
async function init() {
    await Moralis.initPlugins();
    await Moralis.enableWeb3();
    await listTokens("eth");
  }
async function login() {
  user = Moralis.User.current();
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Hello user! Sign in to continue." }) 
   } catch(error) {
     console.log(error)
   }
  }
  userAddress=user.get('ethAddress');
  document.getElementById("login-btn").innerHTML=userAddress.slice(0,5)+"...."+userAddress.slice(-5,-1);
  document.getElementById("login-btn").style.background="#2852e2";
  document.getElementById("submit-btn").innerHTML="Select Token"; 
}
  async function listTokens(chainName){
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: chainName, // The blockchain you want to use (eth/bsc/polygon)
      });
    tokens=result.tokens;
    let tokenList=document.getElementById("token-list");
    for (const address in tokens){
        let token =tokens[address];
        let list =document.createElement("div");
        list.className="token-row";
        list.setAttribute("token-address",address);
        let html=`<img src="${token.logoURI}"id="token-img"/>
        <span id="token-sym">${token.symbol}</span>`
        list.innerHTML=html;
        list.onclick=(()=>selectToken(address));
        tokenList.appendChild(list);
        console.log("happen");
  }
  // console.log(chain);
}
async function selectToken(address){
    closeToken();
    reset();
    // listTokens();
    tokenTrade[tokenSelectSide]=tokens[address];
    changeTokenDetail();
    console.log(tokenTrade);
    getQuote();
    }
function changeTokenDetail(){
  showLogo;
    if (tokenTrade.From && (tokenTrade.From!=tokenTrade.To) ) {
        // showImagePrimary;
        document.getElementById("primary-token-name").innerHTML = tokenTrade.From.symbol;
        document.getElementById("primary-token-img").src = tokenTrade.From.logoURI;
      }
    if (tokenTrade.To) {
      showLogo;
        // showImageSecondary;
        document.getElementById("secondary-token-name").innerHTML = tokenTrade.To.symbol;
        document.getElementById("secondary-token-img").src = tokenTrade.To.logoURI;
      }
}
async function getQuote() {
    if (tokenTrade.From && tokenTrade.To &&  document.getElementById("From-amount").value){
        document.getElementById("submit-btn").innerHTML="Swap";
    document.getElementById("submit-btn").disabled=false;
    let amt = Number(document.getElementById("From-amount").value * 10 ** tokenTrade.From.decimals);
    const quote = await Moralis.Plugins.oneInch.quote({
      chain: chain, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: tokenTrade.From.address, 
      toTokenAddress: tokenTrade.To.address, 
      amount: amt,
    });
    console.log(quote);
    document.getElementById("estimated-gas").innerHTML=quote.estimatedGas/10**11;
    let finalAmt=quote.toTokenAmount / 10 ** quote.toToken.decimals;

    document.getElementById("To-amount").value = finalAmt;
    }
    else{
        return;
    }
  }
function showToken(side){
    tokenSelectSide=side;
    document.getElementById("all-tokens").style.display="block";
    reset;
}
function showLogo(){
  if (tokenTrade.From){

    document.getElementById("primary-token-img").style.display="block";
  }
    if (tokenTrade.To){

      document.getElementById("secondary-token-img").style.display="block";
    }
}
document.getElementById("secondary-token").onclick=()=>document.getElementById("secondary-token-img").style.display="block";

function closeToken(){
  document.getElementById("search-list").value=""
    document.getElementById("all-tokens").style.display="none";

    
}

// ("btn-logout").onclick = logOut;
async function trySwap() {
  let address = Moralis.User.current().get("ethAddress");
  let amount = Number(document.getElementById("From-amount").value * 10 ** tokenTrade.From.decimals);
  if (tokenTrade.From.symbol !== "ETH" || tokenTrade.From.symbol !== "BNB") {
    const allowance = await Moralis.Plugins.oneInch.hasAllowance({
        chain: chain, 
        fromTokenAddress: tokenTrade.From.address, 
        fromAddress: address, 
        amount: amount,
      });
      console.log(allowance);
      if (!allowance) {
        await Moralis.Plugins.oneInch.approve({
          chain: chain, // The blockchain you want to use (eth/bsc/polygon)
          tokenAddress: tokenTrade.From.address, 
          fromAddress: address, 
        });
      }
    }
    try {
      let receipt = await doSwap(address, amount);
      windows.alert("Swap Complete");
      
    } catch (error) {
      window.alert(error);
    }
    location.reload();
  }
  
  function doSwap(userAddress, amount) {
    return Moralis.Plugins.oneInch.swap({
      chain: chain, // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: tokenTrade.From.address, 
      toTokenAddress: tokenTrade.To.address, 
      amount: amount,
      fromAddress: userAddress, 
      slippage: 1,
    })
    ;

  }
  function toFixed(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
      }
    }
    return x;
  }
  document.querySelector('body').addEventListener('mousemove',eyeMove);
  function eyeMove(){
    var eye=document.querySelectorAll(".eye");
    eye.forEach(function(eye)
    {
      
      let x=(eye.getBoundingClientRect().left)+(eye.getBoundingClientRect().width /2);
      let y=(eye.getBoundingClientRect().left)+(eye.getBoundingClientRect().height /2);
      let radian =-Math.atan2(event.pageX -x,event.pageY - y);
      let rot =radian*(180/Math.PI)-180;
      eye.style.transform=`rotate(${rot}deg)`
    })
  }
  function showFullAddress(){
    if(user){
      document.getElementById("login-btn").innerHTML=userAddress; 
      setTimeout(()=>document.getElementById("login-btn").innerHTML=userAddress.slice(0,5)+"...."+userAddress.slice(-5,-1),2500)
    }
  }
  function poly(){
    document.getElementById('poly').style.display="none";
    document.getElementById('eth').style.display="flex";
    document.getElementById('bsc').style.display="flex";
    document.getElementById('upper-item').innerText=" Polygon";
    document.getElementById('upper-item-img').src="assets/polygon.png";
    chain="polygon";
    document.getElementById("token-list").innerHTML="";
    listTokens("polygon");
  }
  function bsc(){
    document.getElementById('bsc').style.display="none";
    document.getElementById('eth').style.display="flex";
    document.getElementById('poly').style.display="flex";
    document.getElementById('upper-item').innerText=" Binance Chain";
    document.getElementById('upper-item-img').src="assets/bsc.png";
    chain="bsc";
    document.getElementById("token-list").innerHTML="";
    listTokens("bsc");
  }
   function eth(){
    document.getElementById('eth').style.display="none";
    document.getElementById('bsc').style.display="flex";
    document.getElementById('poly').style.display="flex";
    document.getElementById('upper-item').innerText=" Ethereum";
    document.getElementById('upper-item-img').src="assets/ethereum.png";
    chain="eth";
    document.getElementById("token-list").innerHTML="";
     listTokens("eth");
  }
  init();
  document.getElementById("primary-token").onclick=(()=>showToken("From"));
  document.getElementById("secondary-token").onclick=(()=>showToken("To"));
  document.getElementById("close-token-list").onclick=closeToken;
  document.getElementById("poly").onclick=poly;
  document.getElementById("bsc").onclick=bsc;
  document.getElementById("eth").onclick=eth;
  document.getElementById("From-amount").onblur=getQuote;
  document.getElementById("submit-btn").onclick=trySwap;
  document.getElementById("login-btn").onmouseover=showFullAddress;
  document.getElementById("From-amount").addEventListener('keyup', function () {
    clearTimeout(type_timer);
    type_timer = setTimeout(getQuote,10);
  });
  document.getElementById("From-amount").addEventListener('keydown', function () {
    clearTimeout(type_timer);
  });
  async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
  }
  document.getElementById("login-btn").onclick = login;
  function reset(){
    const items = document.querySelector('#token-list').children;
    for (let item of items) {
      item.style.display = "block";
    }
  }
    let timer;
    const input = document.querySelector('#search-list');
    input.addEventListener('keyup', function (e) {
    //  reset(e); 
        clearTimeout(timer);
    timer = setTimeout(() => {
      const items = document.querySelector('#token-list').children;
      for (let item of items) {
        item.style.display = item.textContent.includes(e.target.value)
          ? "block"
          : "none";
      }
    }, 500);
  });