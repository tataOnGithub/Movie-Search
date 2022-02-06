// For Button1 
let input1 = document.getElementById('input-id-1');
let button1 = document.getElementById('button-id-1');
let countryWrapper = document.getElementById('country-wrapper');
let years = document.getElementById('years');
let actors = document.getElementById('actors');

// For Button2
let button2 = document.getElementById('button-id-2');
let input2 = document.getElementById('input-id-2');
let input3 = document.getElementById('input-id-3');
let input4 = document.getElementById('input-id-4');
let sectionWrapper = document.getElementById('section2-wrapper');
let moviesLength = document.getElementById('movies-length');
let population = document.getElementById('countries-population');

button2.addEventListener('click', function(event) {
    event.preventDefault();
    moviesLength.innerHTML = '';
    population.innerHTML = '';
    let value2 = input2.value;
    let value3 = input3.value;
    let value4 = input4.value;
    input2.value = '';
    input3.value = '';
    input4.value = '';

    getMoviesData(value2, value3, value4);
});   

async function getMoviesData(...movies) {
    let moviesData = await Promise.all(movies.map(name => getMovie(name))).then(data => data.map(el => ({
        runtime: parseInt(el.Runtime),
        countries: el.Country.split(', '),
    })));
    let totalRuntime = 0;
    moviesData.forEach(el => {
        totalRuntime+=el.runtime;
    });

    let set = [...new Set(moviesData.map(el => el.countries).flat())];
    const totalPopulation = await Promise.all(
        set.map(name => getCountryData(name))
    ).then(data => data.map(el => el[0].population))
    .then(p => p.reduce((a, c) => a + c));
    
    moviesLength.innerHTML = `Duration Of All Movies: ${totalRuntime} mins`;
    population.innerHTML = `Population Of All Countries: ${totalPopulation}`;
}


button1.addEventListener('click', function(event) {
    event.preventDefault();
    countryWrapper.innerHTML = '';
    let value = input1.value;
    input1.value = '';
    getMovieData(value);
});   

async function getMovieData(name) {
    let movieData = await getMovie(name).then((data) => ({
        year: data.Year, 
        actors: data.Actors, 
        country: data.Country.split(", "),
    }));
    const countryData = await Promise.all(
        movieData.country.map((countryName) => getCountryData(countryName))
    ).then(data => data.map(el => ({
        name: el[0].name.official,
        flag: el[0].flags.png, 
        currency: Object.keys(el[0].currencies)[0],
    }))).catch(err => console.log('can not find'));

    renderMovieData(movieData, countryData);
}

function renderMovieData(m, c) {
    getMovieYear(m);
    getMovieActors(m);
    getMovieCountries(c);
}

function getMovieYear(m) {
    let currentYear = new Date().getFullYear();
    let year = parseInt(m.year);
    years.innerHTML = `Released: ${currentYear-year} Years Ago`;
}

function getMovieActors(m) {
        let actorsList = [];
        actorsList.push(m.actors);
        let newList = actorsList.join('');
        actorsList = newList.split(', ');
        newList = actorsList.join(' ');
        actorsList = newList.split(' ');
        let finalArr = [];
        for (let i=0; i<actorsList.length; i++) {
            if(i%2==0) {
                finalArr.push(actorsList[i]);
            }
        }
        let finalString = finalArr.join(', ');
        actors.innerHTML = 'Actors: ' + finalString;
}

function getMovieCountries(c) {
    let flagCountry = '';
    let currency = '';
    let parentDiv = document.createElement('div');
    parentDiv.classList.add('parent-div');
    countryWrapper.appendChild(parentDiv);
    for (let i=0; i<c.length; i++) {
        flagCountry = c[i].flag;
        currency = c[i].currency;

        let childDiv = document.createElement('div');
        childDiv.classList.add('child-div');
        parentDiv.appendChild(childDiv);

        let movieCountry = document.createElement('p');
        movieCountry.classList.add('movie-country');
        let currencyTag = document.createElement('p');
        currencyTag.classList.add('currency');
        let flagTag = document.createElement('img');
        flagTag.classList.add('flag');
        parentDiv.appendChild(movieCountry);
        parentDiv.appendChild(currencyTag);
        parentDiv.appendChild(flagTag);

        movieCountry.innerHTML = c[i].name + ': ';
        currencyTag.innerHTML = 'Currency: ' + currency;
        flagTag.src = flagCountry;
    }
}

function getMovie(title) {
    return fetch(`http://www.omdbapi.com/?t=${title}&apikey=3ea72128`).then(res => res.json());
}

function getCountryData(name) {
 return fetch(`https://restcountries.com/v3.1/name/${name}`).then(response => response.json());
}
