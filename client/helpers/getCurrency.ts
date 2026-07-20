export default function getCurrency(){
    const currency = localStorage.getItem('currency');
    if (currency==="USD") return "$";
    if(currency==="SP") return "ل.س";
    return "$";
}
