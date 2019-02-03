const Plugin = require('powercord/Plugin');
const { inject: pcInject } = require('powercord/injector');
const { waitFor, getOwnerInstance, createElement } = require('powercord/util');
const { resolve } = require('path');

module.exports = class LetterCount extends Plugin {
  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.length = 0;
    await waitFor('.channelTextArea-rNsIhG');

    const updateInstance = () =>
      (this.instance = getOwnerInstance(document.querySelector('.channelTextArea-rNsIhG')));
    const instancePrototype = Object.getPrototypeOf(updateInstance());

    pcInject('pc-lettercount-mount', instancePrototype, 'componentDidMount', (args) => {
      updateInstance();
      this.inject(document.getElementsByClassName(this.instance.props.className)[0])
    });

    pcInject('pc-lettercount', instancePrototype, 'componentDidUpdate', async (args) => {
      updateInstance();
      this.length = args[0].value.length;
      await waitFor('.powercord-lettercount');
      document.getElementsByClassName('powercord-lettercount')[0].innerHTML = `${this.length} / 2000`
    });
  }

  unload () {
    this.unloadCSS();
    Array.from(document.querySelectorAll('.pc-lettercounter')).map(c => c.parentNode).forEach(c => {
      c.innerHTML = c._originalInnerHTML;
    });
  }

  inject (textarea) {
    textarea._originalInnerHTML = textarea.innerHTML;
    textarea.parentNode.prepend(
      createElement('div', {
        className: 'powercord-lettercount',
        innerHTML: `${this.length} / 2000`
      })
    )
  }
};
