const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIE_PER_PAGE = 12

// 電影清單
const movies = []
// 搜尋清單
let filteredMovies = []
//記錄目前分頁，確保切換模式資料不會跑掉
let currentPage = 1


const dataPanel = document.querySelector('#data-panel')
const SearchForm = document.querySelector('#search-form')
const SearchInput = document.querySelector('#search-input')
const Paginator = document.querySelector('#paginator')
const ChangeMode = document.querySelector('#change-mode')
// 喧染Card function
// 非列表模式就顯示此畫面
function renderMovieList(data) {
  if(dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''
    data.forEach((item) => {
    rawHTML += `
    <div  class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
          <div class ="card-body">
            <h5 class ="card-title">${item.title}</h5>
          </div>
          <div class ="card-footer">
            <button class ="btn btn-primary btn-show-movie" data-toggle="modal"data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class ="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
    `
   });
  //  如果dataPanel內含有list-mode就顯示此畫面
   dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode') {
      let rawHTML = `<ul class="list-index col-sm-12 mb-2">`
        data.forEach((item)  => {
        rawHTML += `
        <li class ="card-body d-flex justify-content-between">
          <h5 class ="card-title">${item.title}</h5>
        <div>
          <button class ="btn btn-primary btn-show-movie" data-toggle="modal"
          data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class ="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>    
        </div>
        </li>
      `
  })
      rawHTML += '</ul>'
      dataPanel.innerHTML = rawHTML
  }
} 


//頁數function
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  //製作template
  let rawHTML = ''
  for (let page = 1 ; page <= numberOfPages ; page++){
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `
  }
  Paginator.innerHTML = rawHTML 
}

function getMovieByPage (page) {
  //利用三元運算子，如果搜尋清單有東西就顯示 filteredMovies,否則就選取總清單 movies
  const data = filteredMovies.length ? filteredMovies : movies//
  //將每頁顯示12筆資料
  const startIndex =  (page -1) * MOVIE_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}

//設定modal function
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
    // console.log(data) 
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release data:' + data.release_date
    modalDescription.innerHTML = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="card-image">`

  })
}

function addToFavorite (id) {
  //用localStorage.setItem放入String
  //用 || [] 若左邊不成立就給一個空陣列
  //JSON.parse = 存入時將資料轉成JSON格式
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //用find在movies內依依比對,找到第一個符合條件的就會停下來回傳會停下來回傳該item
  const movie = movies.find((movie) => movie.id === id)
  //用some找出相同的ID,若收藏清單中有相同id就不要再加入
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//渲染切換模式的function
function ChangeDisplay(display) {
  if (dataPanel.dataset.mode === display) return
  dataPanel.dataset.mode = display 
  console.log(dataPanel.dataset.mode)
  
}

// 模式切換監聽器
ChangeMode.addEventListener('click', function onChangeMode(e) {
  if(e.target.matches('#card-mode-button')) {
  ChangeDisplay('card-mode')
  renderMovieList(getMovieByPage(currentPage))
  // console.log(e.target)
  }else if(e.target.matches('#list-mode-button')) {
  ChangeDisplay('list-mode')
  renderMovieList(getMovieByPage(currentPage))
  // console.log(e.target)
  }
})

// dataPanel監聽器
dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(e.target.dataset.id)
    console.log(e.target.dataset.id)
  }else if (e.target.matches('.btn-add-favorite')) {
  addToFavorite(Number(e.target.dataset.id))
  console.log(e.target)
  }
})

// Search事件監聽器
SearchForm.addEventListener('submit', function onSearchFormSubmit(e){
  //防止頁面刷新
  e.preventDefault()
  console.log('click')
  
  const keyword = SearchInput.value.trim().toLowerCase()
  
  //方法一
  // if (!keyword.length) {
  //   return alert('請輸入正確片名')
  // }

  // for (let movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  //方法二
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字 ${keyword} 沒有搜尋到`)
  }
  currentPage = 1
  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(currentPage))
})


Paginator.addEventListener('click', function onPaginatorClicked(e){
  //如果被點擊的不是 a 標籤就結束
  if (e.target.tagName !== 'A') return

  //透過dataset取得取得被點擊的頁數
  const page = Number(e.target.dataset.page)
  //更新畫面
  currentPage = page
  renderMovieList(getMovieByPage(currentPage))
})

axios.get(INDEX_URL)
  .then(response => {
    //Step1 console.log(response)有沒有正確抓取到API
    //Array(80)可以用for loop 以及push後方加上...
    //method1 for loop
    // for (const movie of response.data.results) {
    //   movies.push(movie)
    // }

    //method2 add ...
    movies.push(...response.data.results)
    // console.log(movies)
    renderPaginator(movies.length)
    renderMovieList(getMovieByPage(currentPage))
    
  })
  .catch((err) => console.log(err))
