//Select Required Components
const frmSearch = document.querySelector("#frm-search");
const pgBack = document.querySelector("#pg-back");
const pgNext = document.querySelector("#pg-next");
const btnFavourites = document.querySelector("#btn-favourites");
var movieContent = [];
var favourites = [];

//Load Stored Data
if (localStorage.getItem("movie-favourites")) {
    favourites = JSON.parse(localStorage.getItem("movie-favourites"));
}

//Setting Initial Page Values
var page = 1;
var pageLast = 1;

//Function To Fetch Movies Information
const getContent = async (movieName) => {
    try {
        movieName = movieName.trim();
        var response = await fetch(`http://www.omdbapi.com/?s=${movieName}&apikey=${apiKey}&page=${page}`);
        if (response.status == 401) {
            throw Error();
        }
        const data = await response.json();
        var result = data.Search;
        return result;
    } catch (e) {
        console.log(e);
        alert("Content Not Found! Please Verify OMDB Key");
        return undefined;
    }
}


//Function To Get Movie Deatails
const getDetails = async (id) => {
    try {
        showLoading();
        var response = await fetch(`http://www.omdbapi.com/?i=${id}&apikey=${apiKey}&plot=full`);
        const data = await response.json();
        var result=data;
        return result;
    } catch (e) {
        console.log(e);
    }
}

//Function To Display Information Related To Selected Movie
const movieSelected = async (source) => {
    var divMovieList = document.querySelector(".movie-list");

    var movie = await getDetails(source.imdbID);

    divMovieList.innerHTML = "";

    var divMovieDetails = document.createElement("div");

    var movieTitle = document.createElement("h2");
    movieTitle.textContent = movie.Title;
    var imgMovie = document.createElement("img");
    imgMovie.src = movie.Poster;
    imgMovie.type = "image/alt";
    imgMovie.alt = movie.Title;
    imgMovie.addEventListener("error", () => {
        imgMovie.src = "./public/placeholder.jpg";
    });
    var movieRelease = document.createElement("p");
    movieRelease.textContent = movie.Released;
    var movieGenre = document.createElement("p");
    movieGenre.textContent = `Genre : ${movie.Genre}`;
    var movieSummary = document.createElement("p");
    movieSummary.textContent = movie.Plot;
    console.log(movie);

    var imgFavourite = document.createElement("img");
    imgFavourite.src = "./public/star-empty.png"
    imgFavourite.id = "img-favourite";

    var favourite = checkFavourite(source) ? 1 : 0;

    if (favourite == 1) {
        imgFavourite.src = "./public/star-full.png"
    }

    imgFavourite.addEventListener("click", (e) => {
        try {
            if (favourite != 1) {
                addFavourite(movie);
                imgFavourite.src = "./public/star-full.png"
                favourite = 1;
            } else {
                favourites = favourites.filter( (target) => target.imdbID != source.imdbID);
                imgFavourite.src = "./public/star-empty.png"
                favourite = 0;
            }
            saveFavourites();
        } catch (e) {
            saveFavourites();
        }     
    })

    divMovieDetails.append(imgFavourite, movieTitle, movieRelease, imgMovie, movieGenre, movieSummary);

    divMovieList.append(divMovieDetails);
}

//Function To Check IF A Movie Is A Favourite
const checkFavourite = (item) => {
    var status = 0;
    favourites.forEach((elem) => {
        if (elem.imdbID == item.imdbID) {
            status = 1;
        }
    })
    return status;
}

//Function To Add A Movie As A Favourite
const addFavourite = (movie) => {
    favourites.forEach( (item) => {
        if (item == movie) {
            favourites = favourites.filter( (target) => target.imdbID != item.imdbID);
            throw Error();
        }
    })
    favourites.push(movie);
    saveFavourites();
}

//Function To Display Found Movie Content
const fillList = (content) => {
    var divMovieList = document.querySelector(".movie-list");

    divMovieList.innerHTML = "";

    content.forEach((movie) => {
        var spanMovie = document.createElement("span");
        spanMovie.classList.add("span-movie");

        var imgMovie = document.createElement("img");
        imgMovie.src = movie.Poster;
        imgMovie.setAttribute("type", "image/jpg");
        imgMovie.alt = movie.Title;
        imgMovie.addEventListener("error", () => {
            imgMovie.src = "./public/placeholder.jpg";
        });
        var titleMovie = document.createElement("h3");
        titleMovie.textContent = movie.Title;
        var yearMovie = document.createElement("h4");
        yearMovie.textContent = movie.Year;

        spanMovie.addEventListener("click", () => {
            movieSelected(movie);
        })

        spanMovie.append(imgMovie, titleMovie, yearMovie);

        divMovieList.appendChild(spanMovie);
    });
}

//Function To Display A Loading Image
const showLoading = () => {
    var divMovieList = document.querySelector(".movie-list");

    divMovieList.innerHTML = "";

    var imgLoad = document.createElement("img");
    imgLoad.src = "./public/loading-icon.png";
    imgLoad.id = "img-load";

    divMovieList.append(imgLoad);
}

//Function To Get Movies And Display Page Number
const getMovies = async () => {
    var divNav = document.querySelector(".div-nav");
    var pgDisplay = document.querySelector("#txt-pgno");
    pgDisplay.textContent = "";

    showLoading(); 

    var query = document.querySelector("#txt-input").value;

    var content = [];
    content = await getContent(query);

    if (content != undefined) {
        divNav.style.visibility = "visible";
        pgDisplay.textContent = page;
        movieContent = content;
    } else {
        page = pageLast;
        alert("Movies Not Found");  
        pgDisplay.textContent = page;
    }

    pageLast = page;

    fillList(movieContent);
}

//Event Handling For Back Button
pgBack.addEventListener("click", () => {
    try {
        if (page > 1) {
            page--;
            getMovies();
        } else {
            throw Error();
        }
    } catch {
        alert("No previous records found");
    }
});

//Event Handling For Next Button
pgNext.addEventListener("click", () => {
    try {
        page++;
        getMovies();
    } catch {
        alert("No further records found");
        page--;
        getMovies();
    }
});

//Event Handling For Search Form
frmSearch.addEventListener("submit", async (event) => {
    apiKey = document.querySelector("#omdb-key").value;
    event.preventDefault();
    page = 1;
    getMovies();
});

//Event Handling For Favourites Button
btnFavourites.addEventListener("click", async () => {
    if (favourites.length > 0) {
        showLoading();
        fillList(favourites);
    }
    else {
        alert("No movies added to favourites");
    }
});

//Function To Save Favourite List To Local Storage
const saveFavourites = () => {
    localStorage.setItem("movie-favourites", JSON.stringify(favourites));
}
