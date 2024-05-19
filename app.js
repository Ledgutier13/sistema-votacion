let votos = { si: 0, no: 0, abstenerse: 0 };
let opcionSeleccionada = null;
let grafica;
const usuarios = {
    cher2024: { contrasena: '2024', haVotado: false },
    sua2024: { contrasena: '2024', haVotado: false },
    sel2024: { contrasena: '2024', haVotado: false },
    mar2024: { contrasena: '2024', haVotado: false },
    led2024: { contrasena: '2024', haVotado: false }
};
let usuarioActual = null;

function mostrarPagina(pagina) {
    document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
    document.getElementById(pagina).style.display = 'block';
}

function seleccionarOpcion(opcion) {
    opcionSeleccionada = opcion;
    document.querySelectorAll('#votacion button').forEach(btn => btn.classList.remove('seleccionado'));
    document.getElementById(`btn-${opcion}`).classList.add('seleccionado');
}

function enviarVoto() {
    if (opcionSeleccionada) {
        votos[opcionSeleccionada]++;
        usuarios[usuarioActual].haVotado = true;
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
    localStorage.setItem('titulo', nuevoTitulo);
    localStorage.setItem('descripcion', nuevaDescripcion);
    mostrarPagina('inicio');
}

function borrarVotacion() {
    votos = { si: 0, no: 0, abstenerse: 0 };
    for (let usuario in usuarios) {
        usuarios[usuario].haVotado = false;
    }
    localStorage.removeItem('votos');
    localStorage.removeItem('usuarios');
    alert('La votación ha sido borrada.');
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

window.onload = function() {
    const titulo = localStorage.getItem('titulo');
    const descripcion = localStorage.getItem('descripcion');
    if (titulo) {
        document.getElementById('titulo').innerText = titulo;
    }
    if (descripcion) {
        document.getElementById('descripcion').innerText = descripcion;
    }
    const votosGuardados = localStorage.getItem('votos');
    if (votosGuardados) {
        votos = JSON.parse(votosGuardados);
    }
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
        Object.assign(usuarios, JSON.parse(usuariosGuardados));
    }
};

window.onbeforeunload = function() {
    localStorage.setItem('votos', JSON.stringify(votos));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
};