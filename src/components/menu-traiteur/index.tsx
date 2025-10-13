'use client';

import { Check, Close, ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';
import MenuFR from '../../../data/menu/menu-traiteur.json';
import { Allergene } from './schema_menu';
import { MyLink } from '../commun/link';
import { PrimarySection, TertiarySection } from '../commun/section/sectionType';
import './styles.scss';
import { t, TFunction } from 'i18next';

const ALLERGENES: Allergene[] = [
  'gluten',
  'crustaces',
  'oeufs',
  'poissons',
  'arachides',
  'soja',
  'lactose',
  'fruits-a-coques',
  'celeri',
  'moutarde',
  'sesame',
  'sulfites',
  'lupin',
  'mollusques',
];

interface MenuTraiteurProps {
  locale: string;
}

export const MenuTraiteur: React.FC<MenuTraiteurProps> = ({ locale }) => {
  const refVendredi = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (
      refVendredi.current &&
      new Date().toLocaleDateString('fr') === '17/10/2025'
    ) {
      refVendredi.current.scrollIntoView();
    }
  }, [refVendredi]);
  return (
    <>
      {Object.entries(MenuFR).map(([jour, sectionsJour], i) => {
        const jourEn = jour === 'Jeudi' ? 'Thursday' : 'Friday';
        return (
          <PrimarySection padding='none' key={jour}>
            {i !== 0 && <Divider />}
            <Typography
              variant='h2'
              ref={jour == 'Vendredi' ? refVendredi : null}
            >
              {locale == 'fr' ? jour : jourEn}
            </Typography>
            {sectionsJour.map((section) => (
              <SectionMenu
                key={section.titreFR}
                section={section}
                locale={locale}
                t={t}
              />
            ))}
          </PrimarySection>
        );
      })}
      <TertiarySection padding='none'>
        <MyLink
          href='https://www.lecarredesdelices.com/'
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <Image
            alt='La Maison Hebel'
            src='/images/logo-lcdd.jpg'
            width={368}
            height={250}
            style={{
              objectFit: 'contain',
              borderRadius: '20px',
            }}
          />
        </MyLink>
      </TertiarySection>
    </>
  );
};

type TypeSectionMenu = (typeof MenuFR)['Jeudi'][0];

const SectionMenu: React.FC<{
  section: TypeSectionMenu;
  locale: string;
  t: TFunction;
}> = ({ section, locale, t }) => {
  const keyTitre = locale === 'fr' ? 'titreFR' : 'titreEN';
  return (
    <Box key={section.titreFR}>
      <Typography
        variant='h3'
        style={{ marginTop: '20px', marginBottom: '5px' }}
      >
        {section[keyTitre]}
      </Typography>
      {section.plats.map((plat) => (
        <Accordion key={plat.titreFR}>
          <AccordionSummary
            expandIcon={<ExpandMore sx={{ color: 'white' }} />}
            aria-controls='voir les allergenes'
            style={{
              backgroundColor: 'var(--secondary)',
            }}
          >
            <Typography variant='h4'>{plat[keyTitre]}</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              backgroundColor: 'var(--primary)',
            }}
          >
            <AllergenesPlat plat={plat} t={t} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

type TypePlat = TypeSectionMenu['plats'][0];
const AllergenesPlat: React.FC<{ plat: TypePlat; t: TFunction }> = ({
  plat,
  t,
}) => {
  return (
    <Stack direction='row' justifyContent='center' flexWrap='wrap'>
      {plat.vege && (
        <IndicateurAllergenes
          allergene='vegetarien'
          isKO={false}
          isVege={true}
          t={t}
        />
      )}
      {plat.vegan && (
        <IndicateurAllergenes
          allergene='vegan'
          isKO={false}
          isVege={true}
          t={t}
        />
      )}
      {ALLERGENES.filter((allergene) =>
        plat.allergenes.includes(allergene)
      ).map((allergene) => (
        <IndicateurAllergenes
          allergene={allergene}
          isKO={true}
          key={allergene}
          isVege={false}
          t={t}
        />
      ))}
      {!plat.vege && (
        <IndicateurAllergenes
          allergene='vegetarien'
          isKO={true}
          isVege={true}
          t={t}
        />
      )}
      {!plat.vegan && (
        <IndicateurAllergenes
          allergene='vegan'
          isKO={true}
          isVege={true}
          t={t}
        />
      )}
      {ALLERGENES.filter(
        (allergene) => !plat.allergenes.includes(allergene)
      ).map((allergene) => (
        <IndicateurAllergenes
          allergene={allergene}
          isKO={false}
          key={allergene}
          isVege={false}
          t={t}
        />
      ))}
    </Stack>
  );
};

const IndicateurAllergenes: React.FC<{
  allergene: Allergene | 'vegetarien' | 'vegan';
  isKO: boolean;
  isVege: boolean;
  t: TFunction;
}> = ({ allergene, isKO, isVege, t }) => {
  const allergeneName = t(`pages.menu.allergenes.${allergene}`);

  return (
    <Box
      key={allergene}
      className={classNames(
        'allergene',
        isKO && !isVege && 'allergeneKO',
        isVege && !isKO && 'allergeneVege'
      )}
    >
      <Stack
        alignItems='center'
        width='75px'
        height='100%'
        justifyContent='space-between'
      >
        <Typography
          variant='subtitle1'
          textAlign='center'
          style={{
            lineHeight: '1',
            fontSize: '0.8rem',
          }}
        >
          {allergeneName}
        </Typography>
        {isKO ? <Close /> : <Check />}
      </Stack>
    </Box>
  );
};
