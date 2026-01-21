(function () {
  const iframe = document.createElement("iframe");
  iframe.src = "https://purepeace-chatbot.onrender.com/chat-widget.html";

  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "360px";
  iframe.style.height = "520px";
  iframe.style.border = "none";
  iframe.style.zIndex = "999999";
  iframe.style.background = "transparent";

  document.body.appendChild(iframe);
})();
