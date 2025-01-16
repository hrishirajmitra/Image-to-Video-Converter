document.addEventListener('DOMContentLoaded', function() {
    const tableElement = document.getElementById('table');
    const logoutButtonId = document.getElementById('logoutBtn');
    fetch('/api/GetTable', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                var headerRow = document.createElement('tr');
                ['Username', 'Email', 'Name'].forEach(function(headerText) {
                    var th = document.createElement('th');
                    th.appendChild(document.createTextNode(headerText));
                    headerRow.appendChild(th);
                });
                tableElement.appendChild(headerRow);

                const table = data.table;
                table.forEach(function(user) {
                    const rowElement = document.createElement('tr');
                    let cnt = 0;
                    user.forEach(function(user_data) {
                        cnt += 1;
                        if(cnt != 4) {
                            const cellElement = document.createElement('td');
                            cellElement.appendChild(document.createTextNode(user_data));
                            rowElement.appendChild(cellElement);
                        }
                    });
                    tableElement.appendChild(rowElement);
                });
            }
        })
        .catch(error => console.error(error));

    logoutButtonId.addEventListener('click', function(event) {
        event.preventDefault();
        fetch('/LogoutUser', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.ok) {
                window.location.href = 'index';
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .catch(error => console.error(error));
    });
});
