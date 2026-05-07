import pytest
from generated.calculator import Calculator


def test_add():
    calc = Calculator()
    assert calc.add(1, 2) == 3
    assert calc.add(0, 0) == 0
    assert calc.add(-1, 1) == 0


def test_subtract():
    calc = Calculator()
    assert calc.subtract(2, 1) == 1
    assert calc.subtract(0, 0) == 0
    assert calc.subtract(-1, -1) == 0


def test_multiply():
    calc = Calculator()
    assert calc.multiply(2, 3) == 6
    assert calc.multiply(0, 5) == 0
    assert calc.multiply(-1, -1) == 1


def test_divide():
    calc = Calculator()
    assert calc.divide(6, 2) == 3
    with pytest.raises(ValueError):
        calc.divide(1, 0)


def test_get_history():
    calc = Calculator()
    calc.add(1, 2)
    calc.subtract(2, 1)
    calc.multiply(2, 3)
    calc.divide(6, 2)
    expected_history = [
        'Added 1 + 2 = 3',
        'Subtracted 2 - 1 = 1',
        'Multiplied 2 * 3 = 6',
        'Divided 6 / 2 = 3'
    ]
    assert calc.get_history() == expected_history