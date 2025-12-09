import main
import pytest

def test_operaciones(capsys):
    assert main.a == 10 and main.b == 3, "No cambies los valores iniciales de a y b"
    
    captured = capsys.readouterr()
    output = captured.out
    
    assert "13" in output, "No veo el resultado de la suma (13)"
    assert "1" in output, "No veo el resultado del módulo (1)"
    
    expected_area = 3.14159 * 5 ** 2
    assert abs(main.area - expected_area) < 0.01, f"El área calculada es incorrecta. Esperaba {expected_area}"
    assert str(main.area) in output, "No imprimiste el área"