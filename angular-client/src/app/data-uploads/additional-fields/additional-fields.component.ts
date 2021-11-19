import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { Characteristic, CharacteristicValue, makeEventChar } from '../../services/reference-data.service';





@Component({
  selector: 'app-additional-fields',
  templateUrl: './additional-fields.component.html',
  styleUrls: ['./additional-fields.component.scss']
})

export class AdditionalFieldsComponent implements OnInit, OnChanges {

  @Input()
  characteristics: Characteristic[] = new Array<Characteristic>();

  @Input()
  characteristicValues: CharacteristicValue[] = new Array<CharacteristicValue>();

  @Input()
  additionalFieldsForm: FormGroup;

  @Input()
  formType: string;

  availableCharacteristics = new Array<Characteristic>();
  exclude = ['age', 'sex', 'outconditioncode', 'outstatuscode', 'billlength', 'winglength', 'statusdetails', 'moultscore', 'mass', 'moultnotes', 'bodycondition'];

  constructor() { }

  ngOnInit(): void { }

  filterCharacteristics(characteristicValues: CharacteristicValue[]) {
    const valueIds = characteristicValues.map(cv => cv.characteristicId);
    this.availableCharacteristics = this.characteristics
      .filter(c => !valueIds.includes(c.id) && !this.exclude.includes(c.code))
      .sort((c1, c2) => c1.display.localeCompare(c2.display));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.characteristicValues?.currentValue !== undefined) {
      (changes.characteristicValues.currentValue as CharacteristicValue[]).map(this.addCharacteristicValue, this);
    }

    if (this.characteristics && this.characteristics.length) {
      this.filterCharacteristics(this.additionalFieldsForm.get('characteristicValues').value);
    }
  }

  newCharacteristicValue(e) {
    const c: Characteristic = this.availableCharacteristics.find(chr => chr.id.toString() === e.target.value);
    const cv: CharacteristicValue = { ...c, value: '', characteristicId: c.id, id: null };
    this.addCharacteristicValue(cv);
  }

  addCharacteristicValue(cv: CharacteristicValue) {
    if (this.exclude.includes(cv.code)) {
      return;
    }
    const validators = [Validators.required];
    if (cv.dataType === 'NUMERIC') {
      validators.push(Validators.pattern(/^(?:[0-9]+\.[0-9]+|[0-9]+)$/));
    }
    const newCharValue = new FormGroup({
      label: new FormControl(cv.display),
      characteristicId: new FormControl(cv.characteristicId),
      dataType: new FormControl(cv.dataType),
      value: new FormControl(cv.value, validators)
    });

    (this.additionalFieldsForm.get('characteristicValues') as FormArray).push(newCharValue);
    const i = this.availableCharacteristics.findIndex(c => cv.characteristicId === c.id);
    this.availableCharacteristics.splice(i, 1);
  }

  removeCharacteristicValue(i) {
    const [charValue] = this.characteristicValuesForm.controls.splice(i, 1) as FormGroup[];
    this.characteristicValuesForm.updateValueAndValidity();
    const charId = charValue.controls.characteristicId.value;
    const char: Characteristic = this.characteristics.find(c => c.id === charId);
    const index = this.availableCharacteristics.findIndex(ac => {
      return char.display.localeCompare(ac.display) === -1;
    });
    this.availableCharacteristics.splice(index, 0, char);
  }

  get characteristicValuesForm(): FormArray {
    return this.additionalFieldsForm.get('characteristicValues') as FormArray;
  }

  getValue(idx: number): FormControl {
    return (this.additionalFieldsForm.get('characteristicValues') as FormArray).controls[idx].get('value') as FormControl;
  }

  getLabel(charValFormGroup) {
    return charValFormGroup.controls.label.value;
  }
}
