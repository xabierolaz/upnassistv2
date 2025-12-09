import main
import pytest

def test_variables(capsys):
    # Check 1
    assert hasattr(main, 'mensaje'), "Falta la variable 'mensaje'"
    assert main.mensaje == "¡Hola Mundo Variable!", "El valor de 'mensaje' no es el esperado"
    
    # Check 2
    assert hasattr(main, 'edad'), "Falta la variable 'edad'"
    assert isinstance(main.edad, int), "La variable 'edad' debe ser un número entero (int)"
    
    captured = capsys.readouterr()
    output = captured.out
    
    assert "¡Hola Mundo Variable!" in output, "No se imprimió el mensaje"
    assert str(main.edad) in output, "No se imprimió la edad"
    assert "<class 'int'>" in output, "No se imprimió el tipo de dato (type(edad))"