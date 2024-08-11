const image = document.getElementById('img-wrapper');
const font = document.getElementById('font-style');
const signature = document.getElementById('signature');
const colorPicker = document.getElementById('color-picker');
const undo = document.getElementById('undo');
const save = document.getElementById('save');
const fsize = document.getElementById('font-size');

font.addEventListener('change', () => {
    console.log(font.querySelector('#placeholder'));
    font.querySelector('#placeholder').classList.remove('placeholder');
});

var color;
var data;

const colorMap = {
    red: '#FF416C',
    green: '#94FBAB',
    blue: '#2B4570',
    purple: '#BE3E82',
    orange: '#CC3F0C'
}

const fsizes = {
    1: '18px',
    2: '20px',
    3: '14px'
}

colorPicker.addEventListener('click', (event)=>{
    if (event.target.closest('#color-picker'))
    {
        color = event.target.id;
        color = colorMap[color];
        
        // event.target.style.border = '#333 solid 2px';
    }
});

function checkSessionCookieExists() {
    const cookies = document.cookie.split(';');
    console.log(cookies);
    console.log(document.cookie);
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        console.log(cookie);
        if (cookie.startsWith('session')) {
            return true;  // Session cookie exists
        }
    }
    return false;  // Session cookie does not exist
}

image.addEventListener('click', (event) => {
    console.log(event.target);

    if (signature.value === null || signature.value === "") {
        alert("Please type something before selecting an area");
        return;
    }
    console.log(signature.value);
    const x = event.offsetX;
    const y = event.offsetY;

    const dot = document.createElement('strong');
    dot.id = 'dot';
    dot.innerText = signature.value;
    dot.style.fontFamily = font.value;
    console.log(fsize.value);
    dot.style.fontSize = fsizes[fsize.value];

    console.log(font.value, signature.value);

    //   image
    dot.classList.add('dot');
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    if (color !== null)
    {
        dot.style.color = color;
    }

    // image.parentNode.appendChild(dot);
    image.appendChild(dot);

    font.addEventListener('change', () => {
        dot.style.fontFamily = font.value;
    });
    fsize.addEventListener('change', () => {
        dot.style.fontSize = fsizes[fsize.value];
    });
    
    colorPicker.addEventListener('click', (event)=>{
        if (event.target.closest('#color-picker'))
        {
            color = event.target.id;
            color = colorMap[color];
            dot.style.color = color;
            // event.target.style.border = '#333 solid 2px';
        }
    });
});


let undo_count = 0;

undo.addEventListener('click', ()=> {
    console.log(image.lastChild);

    if (image.lastChild != null && image.lastChild.classList != null && image.lastChild.classList.contains('dot')) { 
        if (undo_count != 1)
        {
            image.removeChild(image.lastChild);
            fetch('/remove', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Data sent:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });

            // reload page
            window.location.href = window.location.href.split('?')[0] + '?reload=' + new Date().getTime();
        }
        else {
            alert("Nothing else to undo");
            undo_count = 0;
        }
    }
    else {
        alert("Nothing else to undo");
    }

    // if (image.lastChild && undo_count != 1){
    //     console.log(image, image.lastChild);
    //     if (image.lastChild.classList.contains('dot')){
    //         image.removeChild(image.lastChild);
    //     }
    //     else {
    //         alert("Nothing else to undo");
    //         undo_count = 0;
    //     }
    // }else {
    //     alert("Nothing else to undo");
    //     undo_count = 0;
    // }
});

const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
        const node = mutation.addedNodes[0];
        data = {
            style_id: node.id,
            text: node.innerText,
            font: node.style.fontFamily,
            color: node.style.color,
            top: node.style.top,
            left: node.style.left
        };
    } else if (mutation.type === "attributes") {
      console.log(`The ${mutation.attributeName} attribute was modified.`);
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(image, config);


save.addEventListener('click', () => {
    console.log('before ', data);
    if (checkSessionCookieExists() === false)
    {
        console.log("then lier")
        fetch('/save-tee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data sent:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    else {
        console.log('running this');
        window.location.href = window.location.href.split('?')[0] + '?reload=' + new Date().getTime();
        alert('You already signed 👀');
        return;
    }
    
})
