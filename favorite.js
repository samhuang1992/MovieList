const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const SearchForm = document.querySelector('#search-form')
const SearchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    // console.log(item)
    //image,title
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="Movie Poster">
          <div class ="card-body">
          <h5 class ="card-title">${item.title}</h5>
          </div>
          <div class ="card-footer">
          <button class ="btn btn-primary btn-show-movie" data-toggle="modal"
          data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class ="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
          </div>
        </div>
      </div>
    </div>
    `
  });

  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  //get element
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  const modalImage = document.querySelector('#movie-modal-image')

  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    // response.data.results
    const data = response.data.results
    console.log(data) 
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release data:' + data.release_date
    modalDescription.innerHTML = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="card-image">`

  })
}

function removeFromFavorite (id) {
  //防止movie是空陣列
  if (!movies || !movies.length) return 
  //透過id找到要刪除電影的index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  //用splice刪除該電影
  movies.splice(movieIndex, 1)
  //存回存回local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  //更新頁面
  renderMovieList(movies)
}

dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id))
    console.log(e.target.dataset.id)
  }else if (e.target.matches('.btn-remove-favorite')) {
  removeFromFavorite(Number(e.target.dataset.id))
  }
})
  renderMovieList(movies)
