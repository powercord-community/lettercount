const { Plugin } = require('powercord/entities');
const { inject } = require('powercord/injector');
const { waitFor, getOwnerInstance, createElement } = require('powercord/util');
const { getModule } = require('powercord/webpack');

module.exports = class LetterCount extends Plugin {
  async startPlugin() {
    const { ComponentDispatch } = getModule(['ComponentDispatch'], false);
    this.loadStylesheet('style.scss');
    await waitFor('.channelTextArea-rNsIhG');

    const updateInstance = () =>
      (this.instance = getOwnerInstance(document.querySelector('.channelTextArea-rNsIhG')));
    const instancePrototype = Object.getPrototypeOf(updateInstance());
    updateInstance();

    const injectCounter = () => {
      const textarea = document.getElementsByClassName('channelTextArea-rNsIhG')[0];
      textarea._originalInnerHTML = textarea.innerHTML;
      const elm = createElement('div', {
        className: 'powercord-lettercount'
      });
      textarea.parentNode.prepend(elm);
      elm.append(
        createElement('div', {
          className: 'powercord-lettercount-value',
          innerHTML: `<strong>${this.instance.state.textValue.length || 0}</strong>`
        })
      );
      elm.append(
        createElement('div', {
          className: 'powercord-lettercount-maxvalue',
          innerHTML: ' / 2000'
        })
      );
    };

    const update = (instance) => {
      const len = instance.state.textValue.length;
      if (len > 2000) {
        //ComponentDispatch.dispatch('SHAKE_APP', { duration: 100, intensity: 3 }) idk why the shake wasn't happening
        document.getElementsByClassName('powercord-lettercount')[0].classList.add('powercord-lettercount-error');
      } else {
        document.getElementsByClassName('powercord-lettercount')[0].classList.remove('powercord-lettercount-error');
      }
    };

    injectCounter();
    inject('pc-lettercount-mount', instancePrototype, 'componentDidMount', () => {
      const old = this.instance;
      updateInstance();
      if (old.props.channel.id !== this.instance.props.channel.id) {
        injectCounter();
      }
    });

    inject('pc-lettercount', instancePrototype, 'render', (args, res) => {
      const field = document.querySelector('.powercord-lettercount-value');
      if (field) {
        updateInstance();
        const val = this.instance.state.textValue;
        if (val !== undefined) field.innerHTML = `<strong>${val.length}</strong>`;
        update(this.instance);
      }
      return res;
    });
    this.instance.componentDidMount();
  }

  pluginWillUnload() {
    Array.from(document.querySelectorAll('.powercord-lettercount')).map(c => c.parentNode).forEach(c => {
      c.innerHTML = c._originalInnerHTML;
    });
  }
};
