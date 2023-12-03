// Variable Global
let categories = {};

//Funcion para seleccionar el nivel de los estudiantes
function generateSelectLevel() {
    return `
        <h2 class="text-center mt-3 mb-4 display-6">Add & View Grades</h2>
        <div class="row justify-content-center">
            <div class="col-12 col-sm-8 col-md-6 col-lg-6">
                <div class="input-group">
                    <select class="custom-select form-control form-control-lg" id="select-level">
                        <option selected value="">Choose a level...</option>
                        <option value="Freshman">Freshman</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Kinder">Kinder</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

// Funcion para filtrar lista de estudiantes
function generateFilterStudents() {
    return `
        <div class="container mt-5">
            <div class="row">
                <div class="col-12 col-md-8">
                    <div class="row">
                        <div class="col-12 col-sm-6 col-md-4 mb-3">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" style="height: 100%;"><i class="fas fa-sort"></i></span>
                                </div>
                                <select class="custom-select form-control" id="filter-order" style="width: 150px;">
                                    <option selected value="">Sort by Lastname...</option>
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="col-12 col-sm-6 col-md-4 mb-3">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" style="height: 100%;"><i class="fas fa-filter"></i></span>
                                </div>
                                <select class="custom-select form-control" id="filter-turn" style="width: 150px;">
                                    <option selected value="">Filter by Turn...</option>
                                    <option value="A.M">A.M</option>
                                    <option value="P.M">P.M</option>
                                </select>
                            </div>
                        </div>

                        <div class="col-12 col-sm-6 col-md-4 mb-3">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" style="height: 100%;"><i class="fas fa-filter"></i></span>
                                </div>
                                <select class="custom-select form-control" id="filter-path" style="width: 150px;">
                                    <option selected value="">Filter by Path Learning...</option>
                                    <option value="JavaScript">JavaScript</option>
                                    <option value="Python">Python</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 text-center d-flex align-items-center justify-content-end mb-3">
                            <button class="btn btn-outline-danger form-control" style="width: 150px;" id="clear-filters"><i class="fas fa-times"></i> Clear Filters</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
}

// Función para mostrar los estudiantes en la tabla
function displayGrades(students) {
    let table = `
        <div class="table-responsive">
            <table class="table mt-4">
                <thead>
                    <tr>
                        <th scope="col">Lastname</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
    `;

    // Agrega las columnas de categorías
    for (let category in categories) {
        for (let i = 1; i <= categories[category]; i++) {
            table += `<th scope="col">${category} ${i}</th>`;
        }
    }

    table += `</tr></thead><tbody id="table-grades" class="table-group-divider">`;

    students.forEach((student) => {
        table += `<tr><td>${student.Lastname}</td><td>${student.Name}</td><th scope="row">${student.Email}</th>`;
        
        // Dentro de la función `displayGrades`...
        for (let category in categories) {
            for (let i = 1; i <= categories[category]; i++) {
                // Obtiene la nota existente
                let grade = _.get(student, `${category}.${category} ${i}`, '');
                table += `<td><input type="text" class="form-control grade-input" id="${category} ${i}-${student.id}" value="${grade}" style='width:70px;'></td>`;
            }
        }

        table += `</tr>`;
    });

    table += `
                </tbody>
            </table>

            <div class="d-flex justify-content-end">
                <button class='btn btn-primary d-flex justify-content-center align-items-center' id='save-grades-button' style='width: 150px;'>
                    <span id='save-grades-button'>Save grades</span>
                </button>
            </div>
        </div>
    `;

    document.getElementById('table-container').innerHTML = table;

    // Agrega un controlador de eventos al botón 'save-grades-button'
    let saveGradesButton = document.getElementById('save-grades-button');
    if (!saveGradesButton.onclick) {
        saveGradesButton.addEventListener('click', function() {
            // Deshabilita el botón y muestra el indicador de carga
            saveGradesButton.disabled = true;
            saveGradesButton.innerHTML = `
            <div class="container-loading">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;

            // Obtén el nivel seleccionado
            const selectedLevel = document.getElementById('select-level').value;
        
            // Obtén la lista de estudiantes para el nivel seleccionado
            getStudentsDataByLevel((students) => {
                // Recorre cada estudiante
                students.forEach((student) => {
                    // Crea un objeto para almacenar las actualizaciones de las calificaciones
                    let gradeUpdates = {};

                    // Para cada estudiante, recorre cada categoría
                    for (let category in categories) {
                        for (let i = 1; i <= categories[category]; i++) {
                            // Obtiene la nota del campo de entrada correspondiente
                            let gradeInput = document.getElementById(`${category} ${i}-${student.id}`);
                            let grade = parseFloat(gradeInput.value);
                            if (!isNaN(grade)) {
                                // Agrega la actualización de la calificación al objeto
                                gradeUpdates[`${category}.${category} ${i}`] = grade;
                            }
                        }
                    }

                    // Actualiza todas las calificaciones a la vez
                    db.collection('users').doc(student.id).update(gradeUpdates).then(() => {
                        console.log('Grades saved successfully.');
                    }).catch((error) => {
                        console.error('Error saving grades: ', error);
                    });
                });

                // Después de guardar todas las calificaciones, obtén la lista de estudiantes para el nivel seleccionado
                getStudentsDataByLevel((students) => {
                    // Muestra las calificaciones
                    displayGrades(students);

                    // Habilita el botón y oculta el indicador de carga
                    saveGradesButton.disabled = false;
                    saveGradesButton.innerHTML = 'Save grades';
                }, selectedLevel);
            }, selectedLevel);
        });
    }

    // Después de crear la tabla...
    document.querySelectorAll('.grade-input').forEach((input) => {
        input.addEventListener('input', function() {
            // Obtiene el ID del estudiante y la categoría del ID del campo de entrada
            const parts = this.id.split('-');
            const categoryNumber = parts[0].split(' ');
            const category = categoryNumber[0];
            const studentId = parts[1];

            // Obtiene la nueva calificación
            let grade = parseFloat(this.value);

            // Formatea la calificación con un decimal y la convierte en una cadena
            grade = grade.toFixed(1);

            // Actualiza la calificación en Firebase
            if (!isNaN(grade)) {
                const docRef = db.collection('users').doc(studentId);
                docRef.get().then((doc) => {
                    if (doc.exists) {
                        docRef.update({
                            [`${category}.${category} ${categoryNumber[1]}`]: grade
                        }).then(() => {
                            console.log('Grade updated successfully.');
                        }).catch((error) => {
                            console.error('Error updating grade: ', error);
                        });
                    } else {
                        console.error('No such document!');
                    }
                }).catch((error) => {
                    console.error('Error getting document:', error);
                });
            }
        });
    });
}

// Función para obtener la lista de estudiantes del nivel seleccionado
function getStudentsDataByLevel(callback, level) {
    db.collection("users").get().then((querySnapshot) => {
        const students = [];
        categories = {}; // Reinicia las categorías
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            if (student.Role === 'Student' && student.Category === level) {
                student.id = doc.id;
                students.push(student);

                // Agrega las categorías del estudiante a las categorías
                for (let category in student) {
                    if (typeof student[category] === 'object' && student[category] !== null) {
                        // Solo cuenta las propiedades que terminan con un número
                        let gradeKeys = Object.keys(student[category]).filter(key => /\d+$/.test(key));
                        categories[category] = gradeKeys.length;
                    }
                }
            }
        });
        callback(students);
    });
}


// Función para construir la página completa de estudiantes por nivel
function buildGradePage() {
    const selectLevel = generateSelectLevel();
    const buttonAddStudent = generateButtonAddStudent("#addGradesModal", "add-grades-button", "Add Grades Categories");
    const fullHTML = `${selectLevel} ${buttonAddStudent} <div id="table-container"></div>`;
    document.getElementById('main-content').innerHTML = fullHTML;

    const addButton = document.getElementById('add-grades-button');
    const levelSelect = document.getElementById('select-level');

    // Inicialmente, deshabilita el botón hasta que se seleccione un nivel
    addButton.disabled = true;

    // Habilita el botón cuando se selecciona un nivel
    levelSelect.addEventListener('change', function() {
        addButton.disabled = this.value === '';
        const selectedLevel = this.value; // Obtén el nivel seleccionado
        getStudentsDataByLevel(displayGrades, selectedLevel); // Pasa el nivel seleccionado como segundo argumento
    });
}

