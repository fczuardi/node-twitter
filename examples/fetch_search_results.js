var  sys = require('sys')
    ,http = require('http');

var  API_URL = 'search.twitter.com'
    ,API_PORT = 80
    ,SEARCH_PATH = '/search'
    ,NUMBER_OF_PAGES = 11
    ,INTERVAL_BETWEEN_REQUESTS = 100 //miliseconds
    ,RESULTS_PER_PAGE = 100

var  fmt = 'json'
    ,entrypoint = SEARCH_PATH + '.' + fmt
    ,query = process.argv[3]
    ,search_params = '?q='+ query + '&rpp=' + RESULTS_PER_PAGE
    ,result_pages = new Array(NUMBER_OF_PAGES)
    ,results = []
    ,results_counter = 0

function doSearch(search_params){
  var  url = entrypoint + search_params
      ,client = http.createClient(API_PORT, API_URL , false)
      ,request = client.request('GET', url, {'host': API_URL});
  request.addListener('response', function(response) {
    response.setEncoding('utf8');
    results_counter += 1;
    if (response.statusCode != 200) { failCallback('Request failed.', response); return false;}
    response.data = response.data ? response.data : '';
    response.on('data', function (chunk) { this.data += chunk;});
    response.on('end', successCallBack);
  });
  console.log('Loading %s…', url);
  request.end(); //make the request
}

function successCallBack(){
  var content = JSON.parse(this.data)
  console.log('Page %s loaded.', content.page);
  result_pages[content.page-1] = content;
  // console.log(content)
  console.log(results_counter);
  console.log(content.page + ' ' + content.next_page+ ' '+ results_counter);
  if ((content.page == 1)&&(content.next_page)){
    for (i=2; i<=NUMBER_OF_PAGES; i++){
      var search_params = content.next_page.replace('?page=2&','?page='+i+'&');
      setTimeout(doSearch, (i*50), search_params);
    }
  }
  if ((results_counter == NUMBER_OF_PAGES)||(!content.next_page)){
    // console.log(result_pages);
    mergeResults();
  }
}

function printTweets(){
  results.forEach(function(result){
    console.log('[%s]%s: %s', result.created_at, result.from_user, result.text);
  });
}
function mergeResults(){
  result_pages.forEach(function(page){
    results = results.concat(page.results);
  });
  console.log(results.length)
  console.log('==========')
  // console.log(results)
  printTweets()
}
function failCallback(msg){
  console.log('fail');
  console.log(msg);
  console.log(this);
}

// search_params = '?page=2&max_id=22178520134&rpp=100&q=%23palmeiras96anos'
doSearch(search_params);