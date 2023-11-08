import React, { Component } from "react";
import classnames from "classnames";
import Loading from "./Loading";
import Panel from "./Panel";
import {
 getTotalPhotos,
 getTotalTopics,
 getUserWithMostUploads,
 getUserWithLeastUploads
} from "helpers/selectors";

const data = [
  {
    id: 1,
    label: "Total Photos",
    getValue: getTotalPhotos
  },
  {
    id: 2,
    label: "Total Topics",
    getValue: getTotalTopics
  },
  {
    id: 3,
    label: "User with the most uploads",
    getValue: getUserWithMostUploads
  },
  {
    id: 4,
    label: "User with the least uploads",
    getValue: getUserWithLeastUploads
  }

];
class Dashboard extends Component {
  state = {
    // show the Loading component until the response comes back from the server
    loading: true,
    // null: in the unfocused four-panel view; #id: corresponding panel view
    focused: null,
    photos:[],
    topics:[]
  };

  selectPanel(id) {
    this.setState((previousState) => ({
      focused: previousState.focused !== null ? null : id // swtich between single and four panels
    }));
  };

  // check if there is saved focus state after we render the application the first time
  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused) {
      this.setState({ focused });
    }

    // bc we're fetching two urls -> parse them both
    const urlsPromise = [
      "/api/photos",
      "/api/topics",
    ].map(url => fetch(url).then(response => response.json()));

    /** since fetching and parsing are both asyn -> need to wrap urlsPromise in a Promise.all
     * when the component mounts we will request our data.
     * After the data returns, we use this.setState to merge it into the existing state object
     */
    Promise.all(urlsPromise)
      .then(([photos, topics]) => {
        this.setState({
          loading: false,
          photos: photos,
          topics: topics
        });
      });
  }


  // listen for changes to the state
  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  render() {
    
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused,
    });

    if (this.state.loading) {
      return <Loading />;
    }

    

    // filter panel data before converting it to components
    const panels = (
      this.state.focused ? data.filter((panel) => this.state.focused === panel.id): data).map((panel) => (
        <Panel
          key={panel.id}
          label={panel.label}
          value={panel.getValue(this.state)}
          onSelect={() => this.selectPanel(panel.id)}
        />
    ));





    return <main className={dashboardClasses}> {panels} </main>;
  }
}

export default Dashboard;
