   var text = document.getElementsByClassName('hobby_text');
        var animationDelay = 6;


     for (let p = 0; p < text.length; p++)   {

        var newDom = '';

        var words = text[p].textContent.split(" ");

        for(let i = 0; i < words.length; i++)
        {
            newDom += '<span class="char">' + (words[i] === ' ' ? '&nbsp;' : words[i] +'&nbsp;') + '</span>';
        }

        console.log(newDom);

        text[p].innerHTML = newDom;
        var length = text[p].children.length;

        for(let i = 0; i < length; i++)
        {
            text[p].children[i].style['animation-delay'] = animationDelay * i + 'ms';
        }
    }