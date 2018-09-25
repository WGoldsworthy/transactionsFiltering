import React, { Component } from 'react';
import './App.css';

import DataHandler from './DataHandler.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="header">
          <Search></Search>
        </div>
      </div>
    );
  }
}

// Initialise Data handler for all components
var dataHandler = new DataHandler();

// Search class
class Search extends Component {

  constructor () {
    super()
    this.dataHandler = new DataHandler();
    this.setUser = this.setUser.bind(this);
  }

  state = {
    query: '',
    response: [],
    startDate: '',
    endDate: '',
    focused: false, //Used to determine when to render the autosuggest
  }

  // Called when user types into user search. Update the query state and 
  // call search function
  onInput = (e) => {
    this.setState({
      query: this.search.value
    });
    this.checkAgainstData(this.search.value);
  }

  // Get a response from the data handler for users based on user input.
  checkAgainstData = (search) => {
    if (search.length >= 1) {
      this.setState({
        response: this.dataHandler.searchUsers(search)
      })
    } else {
      this.setState({response: []});
    }
  }

  // Update the query state with the User clicked on from autosuggest
  setUser = (userId) => {
    this.setState({
      query: userId
    });
  }

  // Function called to suggest possible userIds to the user. 
  // Only render when the 'focus' in on the search box.
  AutoSuggest = () => {
    if (this.state.focused && this.state.response.length >= 0 && document.getElementById('searchInput') == document.activeElement) {
      return this.AutoSuggestResults(this.state.response)
    } else {
      return <ul></ul>
    }
  }

  // Mapping function to turn response from data handler into html list
  AutoSuggestResults = (response) => {
    var suggestions = response.map((userId) => <li onClick={this.setUser.bind(this, userId.toString())} key={userId.toString()}><p>{userId}</p></li>);
    return (
      <ul>{suggestions}</ul>
    );
  }

  // Helper function to listen for unfocus from search box to allow for 
  // derendering of autosuggest.
  componentDidMount () {
    var x = this;
    document.addEventListener("click", function(e) {
      if (e.target != document.getElementById("searchInput")) {
        x.setState({
          focused: false
        });
      }
    });
  }

  // Update start date state with user input
  setStartDate = () => {
    this.setState({
      startDate: new Date(this.startDate.value)
    });
  }

  // Update end date state with user input
  setEndDate = () => {
    this.setState({
      endDate: new Date(this.endDate.value)
    });
  }

  // Prevent the form from submitting and reloading page when hitting enter
  // in the user search box
  onSubmit = (e) => {
    e.preventDefault();
  }

  // Helper function to listen for focusing of the search box
  // Will trigger rendering of autosuggest
  setFocus = () => {
    this.setState({
      focused: true,
    });
  }

  render () {
    return (
      <div>
        <form className="search" onSubmit={this.onSubmit}>
          <div className="userSearch">
            <input className = "searchInput"
            ref={input => this.search = input}
            placeholder="Search for User..." 
            onChange={this.onInput} 
            onFocus={this.setFocus}
            value={this.state.query} 
            id="searchInput" />
            <div className="autoSuggest">{this.AutoSuggest()}</div>
          </div>
          <div className="startDate">
            <p className="dateLabel">Start Date</p>
            <input className="dateInput"
            ref={input => this.startDate = input}
            onChange={this.setStartDate}
            type="date" />
          </div>
          <div className="endDate">
            <p className="dateLabel">End Date</p>
            <input className="dateInput"
            ref={input => this.endDate = input}
            onChange={this.setEndDate}
            type="date" />
          </div>
        </form>
        <Results searchValues={this.state}></Results>
      </div>
    )
  }
}


// Results class
class Results extends Component {

  constructor (props) {
    super(props)
  }

  state = {
    user: '',
    startDate: '',
    endDate: '',
    transactions: '',
    points: '',
    totalTransactions: '',
    totalPoints: '',
    entries: [],
  }

  //Force receiving props from parent (search)
  // Takes states from Search class to update own states
  componentWillReceiveProps(nextProps) {

    if (nextProps.searchValues.query !== this.state.user) {
      this.setState({
        user: nextProps.searchValues.query
      });

      if (nextProps.searchValues.query.length == 0) {
        this.setState({
          totalTransactions: 0,
          totalPoints: 0,
          entries: [],
          transactions: 0,
          points: 0,
        })
      }
    }
    if (nextProps.searchValues.startDate !== this.state.startDate) {
      this.setState({
        startDate: nextProps.searchValues.startDate
      });
    }
    if (nextProps.searchValues.endDate !== this.state.endDate) {
      this.setState({
        endDate: nextProps.searchValues.endDate
      });
    }

    if (nextProps.searchValues.query !== '' && nextProps.searchValues.startDate !== '' && nextProps.searchValues.endDate !== '') {
      this.getTransactionsAmount(nextProps.searchValues.query, nextProps.searchValues.startDate, nextProps.searchValues.endDate);
    }

  }

  // Call to data handler to get relevant information based on the user input
  // Additional functionality to convert response into visual respresentations
  getTransactionsAmount = (user, startDate, endDate) => {
    var response = dataHandler.getTransactionsAmount(
      user, 
      startDate, 
      endDate,
    );

    this.setState({
      transactions: response.transactionsAmount,
      points: response.pointsAmount,
      totalTransactions: response.totalTransactions,
      totalPoints: response.totalPoints,
      entries: response.transactions,
    });

    var toRadial = Math.floor((response.transactionsAmount/response.totalTransactions) * 360)
    var pointsHeight = Math.floor((response.pointsAmount/response.totalPoints) * 115);
    if (response.totalPoints == 0) {
      pointsHeight = 0;
    }
    if (response.totalTransactions == 0) {
      toRadial = 0;
    }

    document.getElementById("transactions").style.strokeDasharray = toRadial.toString() + " 360"; 
    document.getElementById("pointsBar").style.height = pointsHeight + "px";
  }


  // Helper function to convert dates into a standard format.
  parseDate = (date) => {
    var parsedDate = Date.parse(date);
    if (isNaN(parsedDate)) {
      return ''
    } else {
      return new Date(parsedDate).toDateString();
    }
  }

  // Render each transaction in the period onto the timeline in the correct position based
  // on start and end dates.
  renderTransactions = (entries) => {
     if (entries.length > 0) {
      var start = Date.parse(this.state.startDate);
      var end = Date.parse(this.state.endDate);
      var period = end - start;
      var transactions = [];
      entries.forEach(function(entry) {
        var date = Date.parse(new Date(entry.timestamp)) - start;
        var percent = Math.floor( (date/period) * 100);
        transactions.push(percent);
      });

      var i = 0;
      var transactionsPercents = transactions.map((percent) => <div className="transactionMarker" style={{left: percent+ '%'}} key={i++}></div>);
      return (
        <ul>{transactionsPercents}</ul>
      )
    } else {
      return <ul></ul>
    }
  }

  // Render Entries to bottom of page
  renderEntries = (entries) => {
    if (entries.length > 0) {
      var key=0;
      var entriesList = entries.map((entry) => 
        <div className="entry" key={key++} >
          <p className="userId">{entry.user}</p>
          <p className="time">{entry.timestamp.toString()}</p>
          <p className="amount">{entry.amount}</p>
          <p className="pointsTable">{entry.points}</p>
        </div>
      );
      return (
        <ul>
          <div className="entry">
            <p className="userId">User Id</p>
            <p className="time">Time</p>
            <p className="amount">Amount</p>
            <p className="pointsTable">Points</p>
          </div>
          {entriesList}
        </ul>
      );
    } else {
      return <ul></ul>
    }
  }

  render () {
    return (
      <div className="resultsContainer">
        <div className="results">
          <div className="user">

            <p>User: {this.state.user}</p>
          </div>
          <div className="transactions">
            <p className="transactionsNumber">£{this.state.transactions}</p>
            <p className="transactionsTotal">/ £{this.state.totalTransactions} total</p>
            <svg className="transactions_svg" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <circle className="transactionsUnder" cx="50%" cy="50%" r="57"/>
              <circle className="transactionsAmount" id="transactions" cx="50%" cy="50%" r="57"/>
            </svg>
          </div>
          <div className="points">
            <div className="pointsUnder">
              <div className="pointsBar" id="pointsBar"></div>
            </div>
            <div className="pointsNumbers">
              <p className="pointsAmount">{this.state.points}</p>
              <p className="pointsTotal">/ {this.state.totalPoints} total points</p>
            </div>
          </div>
          <div className="timeline">
            <p className="timelineStart">{this.parseDate(this.state.startDate)}</p>
            <div className="line">{this.renderTransactions(this.state.entries)}</div>
            <p className="timelineEnd">{this.parseDate(this.state.endDate)}</p>
          </div>
        </div>
        <div className="entries">
          {this.renderEntries(this.state.entries)}
        </div>
      </div>
    )
  }
}

export default App;
