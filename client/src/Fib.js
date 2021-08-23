import React, {Component} from 'react';
import axios from 'axios'

class Fib extends Component{
    state = {
        seenIndexs: [],
        values: {},
        index: ''
    }

    componentDidMount(){
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues(){
        const values = await axios.get('/api/values/current')
        this.setState({
            values: values.data
        });
    }

    async fetchIndexes(){
        const seenIndexs = await axios.get('/api/values/all')
        this.setState({
            seenIndexs: seenIndexs.data
        });
    }

    renderSeenIndexes(){
        return this.state.seenIndexs.map( ({number}) => number.join(', '))
    }

    renderValues(){
        const entries = []

        for(let key in this.state.values){
            entries.push(
                <div key={key}>
                    For Index {key} I Calculated {this.state.values[key]}
                </div>
            )
        }

        return entries;
    }

    handleSubmit = async e => {
        e.preventDefault();

        await axios.post('/api/values', {
            index: this.state.index
        })

        this.setState({index: ''})
    }

    render(){
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Insert a number</label>
                    <input
                    value={this.state.index}
                    onChange={e => this.setState({index: e.target.value})}
                    type="number" 
                    id="index"
                    />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated Values</h3>
                {this.renderValues()}
            </div>
        )
    }
}

export default Fib;