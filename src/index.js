const Plugin = require('powercord/Plugin');
const { inject: pcInject } = require('powercord/injector');
const { waitFor, getOwnerInstance, createElement } = require('powercord/util');
const { getModule, constants } = require('powercord/webpack');
const { resolve } = require('path');

module.exports = class LetterCount extends Plugin {
  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.length = 0;
    await waitFor('.channelTextArea-rNsIhG');

    const updateInstance = () =>
      (this.instance = getOwnerInstance(document.querySelector('.channelTextArea-rNsIhG')));
    const instancePrototype = Object.getPrototypeOf(updateInstance());

    let _this = this;
    pcInject('pc-lettercount-mount', instancePrototype, 'componentDidMount', function (args) {
      if (_this.instance.props.channel.id !== this.props.channel.id) {
        _this.inject(document.getElementsByClassName(_this.instance.props.className)[0]);
      }
      updateInstance();
    });

    pcInject('pc-lettercount', instancePrototype, 'componentDidUpdate', async (args) => {
      updateInstance();
      this.length = args[0].value.length;
      await waitFor('.powercord-lettercount');
      if (this.length > 2000) {
        getModule(['ComponentDispatch']).ComponentDispatch.dispatch(constants.ComponentActions.SHAKE_APP, {
            duration: 100,
            intensity: 3
        });
        document.getElementsByClassName('powercord-lettercount')[0].classList.add('powercord-lettercount-error')
      } else {
        document.getElementsByClassName('powercord-lettercount')[0].classList.remove('powercord-lettercount-error')
      }
      document.getElementsByClassName('powercord-lettercount')[0].innerHTML = `${this.length} / 2000`;
    });
  }

  unload () {
    this.unloadCSS();
    Array.from(document.querySelectorAll('.powercord-lettercounter')).map(c => c.parentNode).forEach(c => {
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
