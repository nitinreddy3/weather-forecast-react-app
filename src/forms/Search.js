import MobxReactForm from 'mobx-react-form';
import { observable, action } from 'mobx';
import _ from 'lodash';
import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.api.url,
  params: { APPID: config.api.key },
});

let current = [];

class SearchForm extends MobxReactForm {

  @observable items = [];

  onInit() {
    const initial = this.$('search').initial;

    // map initial values
    const $values = _.map(initial, 'value');

    // get data for initial values
    this.load($values);
  }

  @action
  call(val) {
    const params = { q: val, units: 'metric', type: 'like' };

    api.get('/weather', { params })
      .then(action(json => this.items.push({ id: val, data: json.data })))
      .catch(err => console.error(err)); // eslint-disable-line
  }

  @action
  load(values) {
    // get only new ones (omit already called)
    const diff = _.difference(values, current);

    // assign all current values
    current = values;

    // call api only for new values
    diff.map(val => this.call(val));

    // remove unwanted items
    _.remove(this.items, item => !_.includes(current, item.id));
  }

  onChange = (values) => {
    this.$('search').set('value', values);

    // parse values from select input
    const $values = _.chain(values)
      .mapValues('value')
      .values()
      .value();

    // get data for selected values
    this.load($values);
  }
}

export default new SearchForm({
  fields: ['search'],

  values: {
    search: [{
      value: 'lisbon',
      label: 'Lisbon',
    }, {
      value: 'paris',
      label: 'Paris',
    }, {
      value: 'los angeles',
      label: 'Los Angeles',
    }],
  },

});
