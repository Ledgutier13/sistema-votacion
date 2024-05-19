const repoOwner = 'Ledgutier13';
const repoName = 'sistema-votacion';
const filePath = 'data.json';
const branch = 'main';
const token = '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'; // Reemplaza con tu token personal de GitHub

let votos = { si: 0, no: 0, abstenerse: 0 };
let opcionSeleccionada = null;
let grafica;
let usuarios = {};
let usuarioActual = null;

async function fetchData() {
    const response = await fetch(`https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${filePath}`);
    const data = await response.json();
    votos = data.votos;
    usuarios = data.usuarios;
    document.getElementById('titulo').innerText = data.titulo;
    document.getElementById('descripcion').innerText = data.descripcion;
}

async function saveData() {
    const data = {
        titulo: document.getElementById('titulo').innerText,
        descripcion: document.getElementById('descripcion').innerText,
        votos: votos,
        usuarios: usuarios
    };

    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Actualizar datos de votación',
            content: btoa(JSON.stringify(data)),
            sha: await getFileSha()
        })
    });

    if (!response.ok) {
        throw new Error('Error al guardar los datos');
    }
}

async function getFileSha() {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`);
    const data = await response.json();
    return data.sha;
}

async function borrarVotacion() {
    votos = { si: 0, no: 0, abstenerse: 0 };
    for (let usuario in usuarios) {
        usuarios[usuario].haVotado = false;
    }
    await saveData();
    alert('La votación ha sido borrada.');
    mostrarPagina('inicio');
}

function mostrarPagina(pagina) {
    document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
    document.getElementById(pagina).style.display = 'block';
}

function seleccionarOpcion(opcion) {
    opcionSeleccionada = opcion;
    document.querySelectorAll('#votacion button').forEach(btn => btn.classList.remove('seleccionado'));
    document.getElementById(`btn-${opcion}`).classList.add('seleccionado');
}

async function enviarVoto() {
    if (opcionSeleccionada) {
        votos[opcionSeleccionada]++;
        usuarios[usuarioActual].haVotado = true;
        await saveData();
        document.getElementById('confirmacion').style.display = 'block';
        setTimeout(() => {
            mostrarPagina('inicio');
            document.getElementById('verResultadosInicio').style.display = 'block';
        }, 1000);
    } else {
        alert('Por favor, selecciona una opción antes de enviar tu voto.');
    }
}

function guardarTexto() {
    const nuevoTitulo = document.getElementById('nuevoTitulo').value;
    const nuevaDescripcion = document.getElementById('nuevaDescripcion').value;
    document.getElementById('titulo').innerText = nuevoTitulo;
    document.getElementById('descripcion').innerText = nuevaDescripcion;
    saveData();
    mostrarPagina('inicio');
}

function verificarCredenciales() {
    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;
    if (usuario === 'led2024' && contrasena === '2024') {
        mostrarPagina('resultados');
        mostrarResultados();
    } else {
        document.getElementById('mensajeError').style.display = 'block';
    }
}

function verificarCredencialesEditar() {
    const usuario = document.getElementById('usuarioEditar').value;
    const contrasena = document.getElementById('contrasenaEditar').value;
    if (usuario === 'led2024' && contrasena === '2024') {
        mostrarPagina('editar');
    } else {
        document.getElementById('mensajeErrorEditar').style.display = 'block';
    }
}

function verificarCredencialesVotar() {
    const usuario = document.getElementById('usuarioVotar').value;
    const contrasena = document.getElementById('contrasenaVotar').value;
    if (usuarios[usuario] && usuarios[usuario].contrasena === contrasena && !usuarios[usuario].haVotado) {
        usuarioActual = usuario;
        mostrarPagina('votacion');
    } else {
        document.getElementById('mensajeErrorVotar').style.display = 'block';
    }
}

function mostrarResultados() {
    const totalVotos = votos.si + votos.no + votos.abstenerse;
    const porcentajes = {
        si: ((votos.si / totalVotos) * 100).toFixed(2),
        no: ((votos.no / totalVotos) * 100).toFixed(2),
        abstenerse: ((votos.abstenerse / totalVotos) * 100).toFixed(2)
    };

    document.getElementById('porcentajes').innerText = `Sí: ${porcentajes.si}%, No: ${porcentajes.no}%, Abstenerse: ${porcentajes.abstenerse}%`;
    document.getElementById('totalVotos').innerText = `Total de votos: ${totalVotos}`;

    const ctx = document.getElementById('grafica').getContext('2d');

    if (grafica) {
        grafica.destroy();
    }

    grafica = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sí', 'No', 'Abstenerse'],
            datasets: [{
                label: 'Votos',
                data: [votos.si, votos.no, votos.abstenerse],
                backgroundColor: ['#4caf50', '#f44336', '#ffeb3b'],
                borderColor: ['#388e3c', '#d32f2f', '#fbc02d'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Cargar datos al iniciar
window.onload = function() {
    fetchData();
};
