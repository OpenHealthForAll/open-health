import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Combobox} from '@/components/ui/combobox';
import {countries} from '@/lib/countries';
import {cn} from '@/lib/utils';
import {useTranslations} from 'next-intl';

export interface PersonalInfoData {
    gender: string;
    birthDate: string;
    height: string;
    heightUnit: string;
    weight: string;
    weightUnit: string;
    ethnicity: string;
    country: string;
}

interface PersonalInfoProps {
    value: PersonalInfoData;
    onChange: (value: PersonalInfoData) => void;
    touchedFields?: Record<string, boolean>;
}

export default function PersonalInfo({value, onChange, touchedFields = {}}: PersonalInfoProps) {
    const t = useTranslations('Onboarding.personalInfo');

    const isFieldInvalid = (field: keyof PersonalInfoData) => {
        return touchedFields[field] && !value[field];
    };

    const handleChange = (field: keyof PersonalInfoData, fieldValue: string) => {
        const newValue = {...value, [field]: fieldValue};
        onChange(newValue);
    };

    const convertHeight = (val: string, from: string, to: string) => {
        if (!val) return '';
        const num = parseFloat(val);
        if (from === 'cm' && to === 'ft') {
            return (num / 30.48).toFixed(1);
        } else if (from === 'ft' && to === 'cm') {
            return (num * 30.48).toFixed(1);
        }
        return val;
    };

    const convertWeight = (val: string, from: string, to: string) => {
        if (!val) return '';
        const num = parseFloat(val);
        if (from === 'kg' && to === 'lb') {
            return (num * 2.20462).toFixed(1);
        } else if (from === 'lb' && to === 'kg') {
            return (num / 2.20462).toFixed(1);
        }
        return val;
    };

    const handleUnitChange = (field: 'heightUnit' | 'weightUnit', newUnit: string) => {
        const val = field === 'heightUnit' ? value.height : value.weight;
        const oldUnit = value[field];
        const convertedValue = field === 'heightUnit'
            ? convertHeight(val, oldUnit, newUnit)
            : convertWeight(val, oldUnit, newUnit);

        onChange({
            ...value,
            [field]: newUnit,
            [field === 'heightUnit' ? 'height' : 'weight']: convertedValue
        });
    };

    const countryOptions = countries.map(country => ({
        value: country.code,
        label: country.name,
        searchTerms: [
            country.name.toLowerCase(),
            country.code.toLowerCase(),
            `${country.name.toLowerCase()} ${country.code.toLowerCase()}`
        ].join(' ')
    }));

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{t('title')}</h2>
                <p className="text-gray-600">{t('description')}</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <Label>{t('gender.label')}</Label>
                    <div
                        className={cn(
                            "flex space-x-4 p-2 rounded-md",
                            isFieldInvalid('gender') && "border border-red-500 bg-red-50"
                        )}
                    >
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="male"
                                name="gender"
                                value="male"
                                checked={value.gender === 'male'}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="male" className="cursor-pointer">{t('gender.male')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="female"
                                name="gender"
                                value="female"
                                checked={value.gender === 'female'}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="female" className="cursor-pointer">{t('gender.female')}</Label>
                        </div>
                    </div>
                    {isFieldInvalid('gender') && (
                        <p className="text-sm text-red-500">{t('gender.error')}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="birthDate">{t('birthDate.label')}</Label>
                    <Input
                        type="date"
                        id="birthDate"
                        value={value.birthDate}
                        onChange={(e) => handleChange('birthDate', e.target.value)}
                        className={cn(
                            isFieldInvalid('birthDate') && "border-red-500 bg-red-50"
                        )}
                    />
                    {isFieldInvalid('birthDate') && (
                        <p className="text-sm text-red-500">{t('birthDate.error')}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="height">{t('height.label')}</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                id="height"
                                placeholder={value.heightUnit === 'cm' ? t('height.placeholder.cm') : t('height.placeholder.ft')}
                                value={value.height}
                                onChange={(e) => handleChange('height', e.target.value)}
                                className={cn(
                                    isFieldInvalid('height') && "border-red-500 bg-red-50"
                                )}
                            />
                            <Select value={value.heightUnit}
                                    onValueChange={(val) => handleUnitChange('heightUnit', val)}>
                                <SelectTrigger className="w-24">
                                    <SelectValue placeholder="Unit"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cm">cm</SelectItem>
                                    <SelectItem value="ft">ft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {isFieldInvalid('height') && (
                            <p className="text-sm text-red-500">{t('height.error')}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="weight">{t('weight.label')}</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                id="weight"
                                placeholder={value.weightUnit === 'kg' ? t('weight.placeholder.kg') : t('weight.placeholder.lb')}
                                value={value.weight}
                                onChange={(e) => handleChange('weight', e.target.value)}
                                className={cn(
                                    isFieldInvalid('weight') && "border-red-500 bg-red-50"
                                )}
                            />
                            <Select value={value.weightUnit}
                                    onValueChange={(val) => handleUnitChange('weightUnit', val)}>
                                <SelectTrigger className="w-24">
                                    <SelectValue placeholder="Unit"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="lb">lb</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {isFieldInvalid('weight') && (
                            <p className="text-sm text-red-500">{t('weight.error')}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ethnicity">{t('ethnicity.label')}</Label>
                    <Select
                        value={value.ethnicity}
                        onValueChange={(val: string) => handleChange('ethnicity', val)}
                    >
                        <SelectTrigger className={cn(
                            isFieldInvalid('ethnicity') && "border-red-500 bg-red-50"
                        )}>
                            <SelectValue placeholder={t('ethnicity.placeholder')}/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="east_asian">{t('ethnicity.options.east_asian')}</SelectItem>
                            <SelectItem value="southeast_asian">{t('ethnicity.options.southeast_asian')}</SelectItem>
                            <SelectItem value="south_asian">{t('ethnicity.options.south_asian')}</SelectItem>
                            <SelectItem value="european">{t('ethnicity.options.european')}</SelectItem>
                            <SelectItem value="middle_eastern">{t('ethnicity.options.middle_eastern')}</SelectItem>
                            <SelectItem value="african">{t('ethnicity.options.african')}</SelectItem>
                            <SelectItem value="african_american">{t('ethnicity.options.african_american')}</SelectItem>
                            <SelectItem value="pacific_islander">{t('ethnicity.options.pacific_islander')}</SelectItem>
                            <SelectItem value="native_american">{t('ethnicity.options.native_american')}</SelectItem>
                            <SelectItem value="hispanic">{t('ethnicity.options.hispanic')}</SelectItem>
                            <SelectItem value="mixed">{t('ethnicity.options.mixed')}</SelectItem>
                            <SelectItem value="other">{t('ethnicity.options.other')}</SelectItem>
                        </SelectContent>
                    </Select>
                    {isFieldInvalid('ethnicity') && (
                        <p className="text-sm text-red-500">{t('ethnicity.error')}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="country">{t('country.label')}</Label>
                    <Combobox
                        options={countryOptions}
                        value={value.country}
                        onValueChange={(val) => handleChange('country', val)}
                        placeholder={t('country.placeholder')}
                        searchPlaceholder=""
                        className={cn(
                            isFieldInvalid('country') && "border-red-500 bg-red-50"
                        )}
                    />
                    {isFieldInvalid('country') && (
                        <p className="text-sm text-red-500">{t('country.error')}</p>
                    )}
                </div>
            </div>
        </div>
    );
} 