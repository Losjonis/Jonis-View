// A single, consistent set of small outline icons for the desktop controls.
window.ButtonIcons = (() => {
  const paths = {
    camera:'<path d="M8 5l1.5-2h5L16 5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><circle cx="12" cy="12" r="4"/>',
    record:'<circle cx="12" cy="12" r="7"/><circle class="icon-solid" cx="12" cy="12" r="3.5"/>',
    stop:'<rect class="icon-solid" x="6" y="6" width="12" height="12" rx="3"/>',
    replay:'<path d="M4 10a8 8 0 1 1 2 8M4 4v6h6M12 7v5l3 2"/>',
    volume:'<path d="M11 5L6 9H3v6h3l5 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
    muted:'<path d="M11 5L6 9H3v6h3l5 4zM16 9l6 6m0-6l-6 6"/>',
    expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>',
    refresh:'<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',
    settings:'<path d="M4 6h6m4 0h6M4 12h10m4 0h2M4 18h2m4 0h10"/><circle cx="12" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 2M12 16h.01"/>',
    folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11H3zM3 9h18"/>',
    open:'<path d="M14 3h7v7m0-7L11 13M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>'
  };
  function set(button,name,label='') {
    label=window.I18n.t(label);
    if(button.dataset.icon===name && button.dataset.iconLabel===label)return;
    button.dataset.icon=name;button.dataset.iconLabel=label;
    button.innerHTML=`<svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
    if(label){const span=document.createElement('span');span.textContent=label;button.append(span);}
  }
  for(const [id,name,label] of [['refresh','refresh'],['settings','settings','Ajustes'],['help','help'],['mute','volume'],['fullscreen-mute','volume'],['fullscreen','expand'],['close-settings','close'],['close-help','close'],['capture-folder','folder','Carpeta…'],['open-captures','open','Abrir']])set(document.getElementById(id),name,label);
  for(const button of document.querySelectorAll('[data-clip]'))set(button,{image:'camera',record:'record',replay:'replay'}[button.dataset.clip]);
  return {set};
})();
