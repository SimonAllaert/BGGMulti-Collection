const loadData = async () => {
    const games = new Map();
    let [resFlap, resChillo, resPoot, resQ] = await Promise.all([
        getCollection(games, "Flappington"),
        getCollection(games, "chillodude"),
        getCollection(games, "PootPoot13"),
        getCollection(games, "Superspac3"),
    ]);
    const sortedGames = [...games.values()].sort((a, b) => a.name.localeCompare(b.name));
    document.getElementById("tot").innerText = "Total amount of games: " + games.size;
    const root = document.getElementById("root");
    for (const game of sortedGames) {
        const game_link = document.createElement("a");
        game_link.classList.add("game_link");
        game_link.href = "https://boardgamegeek.com/boardgame/" + game.id;
        game_link.target = "_blank";

        const search_helper = document.createElement("div");
        search_helper.classList.add("search_helper");
        search_helper.innerText = game.name.replace(/[^1-9a-zA-Z ]/g, "").trim().toLowerCase();
        game_link.appendChild(search_helper);

        const game_container = document.createElement("div");
        game_container.classList.add("game_container");
        game_link.appendChild(game_container);

        const image_container = document.createElement("div");
        image_container.classList.add("image_container")
        game_container.appendChild(image_container);

        const game_image = document.createElement("IMG");
        game_image.setAttribute("src", game.img);
        game_image.classList.add("game_image");
        image_container.appendChild(game_image);

        const game_info = document.createElement("div");
        game_info.classList.add("game_info");
        game_container.appendChild(game_info);

        const game_title = document.createElement("div");
        game_title.classList.add("game_title");
        game_title.appendChild(document.createTextNode(game.name));
        game_info.appendChild(game_title);

        const game_owners = document.createElement("div");
        game_owners.classList.add("game_owners");
        game_owners.appendChild(document.createTextNode("Owned by " + game.users));
        game_info.appendChild(game_owners);

        root.appendChild(game_link);
    }
    document.getElementById("main").style.display = "inline";
    document.getElementById("loader_container").style.display = "none";
}

const getCollection = async (games, user) => {
    var xmlDoc;
    const response = await fetch('https://boardgamegeek.com/xmlapi2/collection?username=' + user)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "application/xml"))
        .then(data => xmlDoc = data);
    const user_games = xmlDoc.getElementsByTagName("item");
    for (const user_game of user_games) {
        if (user_game.getElementsByTagName("status")[0].attributes.getNamedItem("own").value == 1 || user_game.getElementsByTagName("status")[0].attributes.getNamedItem("preordered").value == 1) {
            const game_id = user_game.attributes.getNamedItem("objectid").value;
            if (games.has(game_id)) {
                const existing_game = games.get(user_game.attributes.getNamedItem("objectid").value);
                const new_users = existing_game.users;
                new_users.push(user);
                games.set(game_id, { id: game_id, name: existing_game.name, img: existing_game.img, users: new_users })
            }
            else {
                const game_name = user_game.getElementsByTagName("name")[0].childNodes[0].nodeValue;
                const game_img = user_game.getElementsByTagName("thumbnail")[0] && user_game.getElementsByTagName("thumbnail")[0].childNodes[0] ? user_game.getElementsByTagName("thumbnail")[0].childNodes[0].nodeValue : "https://drive.google.com/thumbnail?id=1nHLntUYvJmxU6K9RfepamvnCULxqSst8";
                games.set(game_id, { id: game_id, name: game_name, img: game_img, users: [user] });
            }
        }
    }
}

function filterGameName() {
    const search = document.getElementById("search_title").value;
    const game_links = document.getElementsByClassName("game_link");
    for (const game of game_links) {
        if (game.childNodes[0].innerText.includes(search) || substringLevenshtein(game.childNodes[0].innerText, search)) {
            game.style.display = "inline";
        }
        else {
            game.style.display = "none";
        }
    }
}

const substringLevenshtein = (game_name, search) => {
    for (const sub of game_name.split(" ")) {
        if (levenshteinDistance(sub, search) <= 1) {
            return true;
        }
    }
    return false;
}

const levenshteinDistance = (game_name, search) => {
    if (!game_name.length) return search.length;
    if (!search.length) return game_name.length;
    const matrix = [];
    for (let i = 0; i <= search.length; i++) {
        matrix[i] = [i];
        for (let j = 1; j <= game_name.length; j++) {
            matrix[i][j] =
                i === 0
                    ? j
                    : Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + (game_name[j - 1] === search[i - 1] ? 0 : 1)
                    );
        }
    }
    return matrix[search.length][game_name.length];
}

function clearSearch() {
    document.getElementById("search_title").value = "";
    const game_containers = document.getElementsByClassName("game_link");
    for (const game of game_containers) {
        game.style.display = "inline";
    }
}