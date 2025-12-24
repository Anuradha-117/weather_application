console.log("JS loaded");

fetch('http://api.weatherapi.com/v1/current.json?key=7c789b66ae5f48acaf871239252312&q=ratmalana&aqi=no')
.then(res => res.json())
.then(data => console.log(data))