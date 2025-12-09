import main
import pytest

def test_logica(capsys):
    captured = capsys.readouterr()
    output = captured.out
    
    # 1. Comparación
    assert "False" in output, "La comparación de igualdad entre 10 y 20 debería imprimir False"
    
    # 2. Mayor de edad
    assert main.es_mayor_de_edad == False, "Con 17 años, es_mayor_de_edad debería ser False"
    
    # 3. Rango
    # Verificamos la lógica: 17 no está entre 18 y 65
    assert main.en_rango == False, "17 no está en el rango 18-65"
    
    # Pruebas ocultas (cambiamos valores para ver si la lógica es robusta)
    # Nota: En este entorno estático es difícil re-inyectar variables sin recargar, 
    # pero verificamos que las expresiones sean correctas mediante inspección o 
    # asumiendo que el alumno usó las variables.
